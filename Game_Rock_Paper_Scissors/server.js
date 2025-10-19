const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
//const { use } = require("react");
const { log } = require("console");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// 🟢 Serve static folders
app.use('/assets', express.static(path.join(__dirname, 'assets'))); // chứa ảnh, âm thanh
app.use(express.static(path.join(__dirname, "templates"))); // chứa file HTML, CSS, JS

// 🧩 Dữ liệu phòng và bảng xếp hạng
const rooms = {}; // roomCode -> { players: [], choices: {}, scores: {}, gameActive: false }
const leaderboard = {}; // username -> totalWins (in-memory)

io.on("connection", (socket) => {
  console.log("🟢 Connected:", socket.id);

  // --- Người chơi tham gia phòng ---
  socket.on("join_room", ({ username, roomCode }) => {
    socket.join(roomCode);
    if (!rooms[roomCode]) {
      rooms[roomCode] = { players: [], choices: {}, scores: {}, gameActive: false };
    }

    const room = rooms[roomCode];
    if (!room.players.find(p => p.username === username)) {
      room.players.push({ id: socket.id, username });
      room.scores[username] = 0;
    }

    console.log(`👥 ${username} joined ${roomCode}`);
  });

  // --- Bắt đầu trò chơi (có đếm ngược) ---
  socket.on("start_game", ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room) return;
    room.choices = {};
    let count = 3;
    const countdownInterval = setInterval(() => {
      io.to(roomCode).emit("countdown", count);
      count--;
      if (count < 0) {
        clearInterval(countdownInterval);
        room.gameActive = true;
        io.to(roomCode).emit("game_started");
      }
    }, 1000);
  });

  // --- Người chơi chọn ---
  socket.on("player_choice", ({ roomCode, username, choice }) => {
    const room = rooms[roomCode];
    if (!room || !room.gameActive) return;

    if (!room.players.find(p => p.username === username)) return;

    room.choices[username] = choice;
    const expectedChoices = 2; // Số người chơi trong phòng
    if (Object.keys(room.choices).length === expectedChoices) {
      const playersList = room.players
        .filter(p => room.choices[p.username] !== undefined)
        .map(p => ({ username: p.username, choice: room.choices[p.username] }));
      if (playersList.length < 2) return;

      const [p1, p2] = playersList;
      const result = getWinner(p1.choice, p2.choice);
      let winner = null;
      if (result === 1)
        winner = p1.username;
      else if (result === 2)
        winner = p2.username;

      if (winner) room.scores[winner] = (room.scores[winner] || 0) + 1;

      io.to(roomCode).emit("round_result", {
        players: playersList,
        winner,
        scores: room.scores
      });

      const winCount = Object.values(room.scores);
      if (winCount.some(v => v >= 3)) {
        const matchWinner = Object.keys(room.scores).find(u => room.scores[u] >= 3);

        leaderboard[matchWinner] = (leaderboard[matchWinner] || 0) + 1;

        io.to(roomCode).emit("game_over", { winner: matchWinner });

        room.gameActive = false;
        room.choices = {};
        room.players.forEach(p => (room.scores[p.username] = 0));
      } else {
        setTimeout(() => {
          room.choices = {};
          io.to(roomCode).emit("next_round", { scores: room.scores });
        }, 3000);
      }
    }
  });

  // --- Chat ---
  socket.on("chat_message", ({ roomCode, username, text }) => {
    io.to(roomCode).emit("chat_message", { username, text });
  });

  // --- Người chơi rời phòng ---
  // 🛠️ Sửa lỗi lặp & sai chính tả: chỉ giữ lại 1 event duy nhất "leave_room"
  socket.on("leave_room", ({ roomCode }) => {
    socket.leave(roomCode);
    const room = rooms[roomCode];
    if (!room) return;

    // 🛠️ Di chuyển logic rời phòng đúng vị trí, không bị lồng trong event khác
    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    const username = player.username;
    room.players = room.players.filter(p => p.id !== socket.id);
    delete room.scores[username];
    delete room.choices[username];
    io.to(roomCode).emit("player_left", { username });

    // 🛠️ Vị trí đúng: kiểm tra nếu phòng trống thì xóa
    if (room.players.length === 0) delete rooms[roomCode];

    console.log(`🚪 ${username || socket.id} left ${roomCode}`);
  });

  // --- Người chơi ngắt kết nối ---
  // 🛠️ Giữ 1 event "disconnect" duy nhất (xóa bản trùng ở dưới)
  socket.on("disconnect", () => {
    console.log("🔴 Disconnected:", socket.id);
    for (const roomCode of Object.keys(rooms)) {
      const room = rooms[roomCode];
      const idx = room.players.findIndex(p => p.id === socket.id);
      if (idx !== -1) {
        const username = room.players[idx].username;
        room.players.splice(idx, 1);
        delete room.scores[username];
        delete room.choices[username];
        io.to(roomCode).emit("player_left", { username });
        if (room.players.length === 0) delete rooms[roomCode];
      }
    }
  });
});

// --- Hàm xác định người thắng ---
function getWinner(a, b) {
  if (a === b) return 0;
  if (
    (a === "rock" && b === "scissors") ||
    (a === "paper" && b === "rock") ||
    (a === "scissors" && b === "paper")
  ) return 1;
  return 2;
}

// --- Leaderboard ---
app.get('/leaderboard', (req, res) => {
  const list = Object.entries(leaderboard)
    .map(([username, score]) => ({ username, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 50);
  res.json(list);
});

// --- Khởi chạy server ---
server.listen(4001, () => console.log("🚀 Server running on http://localhost:4001"));

// --- Export ---
module.exports = { getWinner, rooms, leaderboard };
