const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// ✅ Serve tất cả file trong thư mục templates
app.use(express.static(path.join(__dirname, "templates")));

// ✅ Serve riêng thư mục âm thanh
app.use("/sounds", express.static(path.join(__dirname, "templates", "sounds")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "templates", "index.html"));
});

const rooms = {}; // Lưu thông tin phòng

io.on("connection", (socket) => {
  console.log("🟢 Connected:", socket.id);

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

  socket.on("start_game", ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room) return;

    room.gameActive = true;
    room.choices = {};
    room.players.forEach(p => (room.scores[p.username] = 0));

    io.to(roomCode).emit("game_started");
    console.log(`🎮 Game started in room ${roomCode}`);
  });

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

      const winCount = Object.values(room.scores);
      if (winCount.some(v => v >= 3)) {
        const matchWinner = Object.keys(room.scores).find(u => room.scores[u] >= 3);
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

  socket.on("chat_message", ({ roomCode, username, text }) => {
    io.to(roomCode).emit("chat_message", { username, text });
  });

  socket.on("disconnect", () => {
    console.log("🔴 Disconnected:", socket.id);
  });
});

function getWinner(a, b) {
  if (a === b) return 0;
  if (
    (a === "rock" && b === "scissors") ||
    (a === "paper" && b === "rock") ||
    (a === "scissors" && b === "paper")
  )
    return 1;
  return 2;
}

server.listen(4001, () => console.log("🚀 Server running on http://localhost:4001"));
