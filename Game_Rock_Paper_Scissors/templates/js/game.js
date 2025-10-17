// 🎮 Game Manager - Quản lý logic game
class GameManager {
    constructor() {
        this.socket = io("http://localhost:4001");
        this.audioManager = window.audioManager;
        
        // Lấy thông tin từ URL
        const params = new URLSearchParams(window.location.search);
        this.username = params.get("name") || "Guest";
        this.currentRoom = (params.get("code") || "ROOM1").toUpperCase();
        
        // DOM elements
        this.playerInfo = document.getElementById("playerInfo");
        this.yourScore = document.getElementById("yourScore");
        this.opponentScore = document.getElementById("opponentScore");
        this.chatMessages = document.getElementById("chatMessages");
        this.choiceSection = document.querySelector(".choice");
        this.buttons = document.querySelectorAll(".choice .btn");
        this.startButton = null;
        
        // Chat popup elements
        this.chatToggle = document.getElementById("chatToggle");
        this.chatPopup = document.getElementById("chatPopup");
        this.chatClose = document.getElementById("chatClose");
        this.chatInput = document.getElementById("chatInput");
        this.sendBtn = document.getElementById("sendBtn");
        this.chatBadge = document.getElementById("chatBadge");
        this.unreadCount = 0;
        
        this.initGame();
        this.setupSocketEvents();
        this.setupUI();
    }

    initGame() {
        // Tạo nút bắt đầu game
        this.startButton = document.createElement("button");
        this.startButton.id = "startGameBtn";
        this.startButton.innerHTML = `
            <i class="fa-solid fa-play"></i>
            <span>Bắt đầu trận đấu</span>
        `;
        document.body.appendChild(this.startButton);
        
        // Ẩn phần chọn lựa ban đầu
        this.choiceSection.style.display = "none";
        this.playerInfo.innerText = `Người chơi: ${this.username} | Phòng: ${this.currentRoom}`;
    }

    setupUI() {
        // Nút bắt đầu game
        this.startButton.addEventListener("click", () => {
            this.audioManager.playClick();
            this.socket.emit("start_game", { roomCode: this.currentRoom });
        });

        // Nút chọn kéo/búa/bao
        this.buttons.forEach((btn) => {
            btn.addEventListener("click", () => {
                this.audioManager.playClick();
                const choice = btn.dataset.choice;
                
                // Ẩn các nút khác
                this.buttons.forEach((b) => {
                    if (b.dataset.choice !== choice) {
                        b.style.display = "none";
                    }
                });
                
                this.socket.emit("player_choice", { 
                    roomCode: this.currentRoom, 
                    username: this.username, 
                    choice 
                });
            });
        });

        // Chat functionality
        this.setupChat();
        
        // Nút thoát game
        document.querySelector(".exit-link").addEventListener("click", () => {
            this.audioManager.playClick();
            this.socket.emit("leave_room", { roomCode: this.currentRoom });
            window.location.href = "index.html";
        });
    }

    setupChat() {
        // Chat toggle functionality
        this.chatToggle.addEventListener("click", () => {
            this.audioManager.playClick();
            this.toggleChatPopup();
        });
        
        // Chat close functionality
        this.chatClose.addEventListener("click", () => {
            this.audioManager.playClick();
            this.closeChatPopup();
        });
        
        // Send message functionality
        this.sendBtn.addEventListener("click", () => {
            const text = this.chatInput.value.trim();
            if (!text) return;
            
            this.socket.emit("chat_message", { 
                roomCode: this.currentRoom, 
                username: this.username, 
                text 
            });
            
            this.chatInput.value = "";
            this.audioManager.playClick();
        });

        this.chatInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                this.sendBtn.click();
            }
        });
        
        // Close chat when clicking outside
        document.addEventListener("click", (e) => {
            if (!this.chatPopup.contains(e.target) && !this.chatToggle.contains(e.target)) {
                this.closeChatPopup();
            }
        });
    }
    
    toggleChatPopup() {
        if (this.chatPopup.classList.contains("show")) {
            this.closeChatPopup();
        } else {
            this.openChatPopup();
        }
    }
    
    openChatPopup() {
        this.chatPopup.classList.add("show");
        this.unreadCount = 0;
        this.updateChatBadge();
        // Scroll to bottom
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }
    
    closeChatPopup() {
        this.chatPopup.classList.remove("show");
    }
    
    updateChatBadge() {
        if (this.unreadCount > 0) {
            this.chatBadge.textContent = this.unreadCount;
            this.chatBadge.style.display = "flex";
        } else {
            this.chatBadge.style.display = "none";
        }
    }

    setupSocketEvents() {
        // Kết nối
        this.socket.on("connect", () => {
            this.socket.emit("join_room", { 
                username: this.username, 
                roomCode: this.currentRoom 
            });
        });

        // Chat message
        this.socket.on("chat_message", (message) => {
            this.addChatMessage(message);
        });

        // Game started
        this.socket.on("game_started", () => {
            this.startGame();
        });

        // Round result
        this.socket.on("round_result", (data) => {
            this.handleRoundResult(data);
        });

        // Next round
        this.socket.on("next_round", ({ scores }) => {
            this.startNextRound();
        });

        // Game over
        this.socket.on("game_over", ({ winner }) => {
            this.endGame(winner);
        });
    }

    addChatMessage(message) {
        const msgDiv = document.createElement("div");
        msgDiv.classList.add("message");
        
        // Phân biệt tin nhắn của mình và đối thủ
        if (message.username === this.username) {
            msgDiv.classList.add("user");
        } else {
            msgDiv.classList.add("opponent");
            // Tăng unread count nếu chat popup đang đóng
            if (!this.chatPopup.classList.contains("show")) {
                this.unreadCount++;
                this.updateChatBadge();
            }
        }
        
        msgDiv.innerHTML = `
            <div class="username">${message.username}</div>
            <div class="text">${message.text}</div>
        `;
        
        this.chatMessages.appendChild(msgDiv);
        
        // Scroll to bottom nếu chat popup đang mở
        if (this.chatPopup.classList.contains("show")) {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }
    }

    startGame() {
        this.buttons.forEach((b) => (b.style.display = "inline-block"));
        this.startButton.style.display = "none";
        this.choiceSection.style.display = "block";
        this.yourScore.innerText = "0";
        this.opponentScore.innerText = "0";
        
        // Hiệu ứng bắt đầu game
        this.choiceSection.classList.add("game-started");
    }

    handleRoundResult(data) {
        const { players, winner, scores } = data;
        const [p1, p2] = players;
        const opponent = p1.username === this.username ? p2.username : p1.username;

        // Cập nhật điểm số
        this.yourScore.innerText = scores[this.username] || 0;
        this.opponentScore.innerText = scores[opponent] || 0;

        // Hiển thị kết quả
        let resultMessage = `${p1.username} chọn ${this.getChoiceEmoji(p1.choice)} vs ${p2.username} chọn ${this.getChoiceEmoji(p2.choice)} → `;
        
        if (winner === "Draw") {
            resultMessage += "Hòa!";
            this.audioManager.playDraw();
        } else {
            resultMessage += `${winner} thắng ván này!`;
            if (winner === this.username) {
                this.audioManager.playWin();
            } else {
                this.audioManager.playLose();
            }
        }
        
        this.showResultModal(resultMessage);
    }

    getChoiceEmoji(choice) {
        const emojis = {
            rock: "✊",
            paper: "✋", 
            scissors: "✌️"
        };
        return emojis[choice] || choice;
    }

    showResultModal(message) {
        const modal = document.createElement('div');
        modal.className = 'result-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Kết quả ván đấu</h3>
                <p>${message}</p>
                <button class="modal-btn">OK</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 3000);
        
        // Manual close
        modal.querySelector('.modal-btn').addEventListener('click', () => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        });
    }

    startNextRound() {
        this.buttons.forEach((b) => (b.style.display = "inline-block"));
    }

    endGame(winner) {
        const message = `🎉 Trận đấu đã kết thúc, ${winner} đã thắng trận này!`;
        this.showResultModal(message);
        
        this.choiceSection.style.display = "none";
        this.startButton.style.display = "block";
        this.audioManager.playWin();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GameManager();
});
