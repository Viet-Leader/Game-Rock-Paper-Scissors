const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

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
    let count = 3;
    const countdownInterval = setInterval(() => {
      io.to(roomCode).emit("countdown", count);
      count--;
      if (count < 0) {
        clearInterval(countdownInterval);
        io.to(roomCode).emit("game_started");
      }
    }, 1000);
  });

  // --- Người chơi chọn ---
  socket.on("player_choice", ({ roomCode, username, choice }) => {
    const room = rooms[roomCode];
    if (!room || !room.gameActive) return;

    room.choices[username] = choice;

    if (Object.keys(room.choices).length === 2) {
      const players = Object.entries(room.choices).map(([u, c]) => ({ username: u, choice: c }));
      const [p1, p2] = players;

      const result = getWinner(p1.choice, p2.choice);
      let winner = "Draw";
      if (result === 1) winner = p1.username;
      else if (result === 2) winner = p2.username;

      if (winner !== "Draw") room.scores[winner]++;

      io.to(roomCode).emit("round_result", {
        players,
        winner,
        scores: room.scores
      });

      // --- Kiểm tra thắng 3 điểm ---
      const winCount = Object.values(room.scores);
      if (winCount.some(v => v >= 3)) {
        const matchWinner = Object.keys(room.scores).find(u => room.scores[u] >= 3);

        leaderboard[matchWinner] = (leaderboard[matchWinner] || 0) + 1;

        io.to(roomCode).emit("game_over", { winner: matchWinner });

        // Reset
        room.gameActive = false;
        room.choices = {};
        room.players.forEach(p => (room.scores[p.username] = 0));
      } else {
        // Reset ván mới sau 3s
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

  socket.on("leave_room", ({ roomCode }) => {
    socket.leave(roomCode);
    console.log(`🚪 Left ${roomCode}`);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Disconnected:", socket.id);
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
