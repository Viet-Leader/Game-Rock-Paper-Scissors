// 🏠 Lobby functionality
class LobbyManager {
    constructor() {
        this.nameInput = document.getElementById('playerName');
        this.createBtn = document.getElementById('createBtn');
        this.enterBtn = document.getElementById('enterBtn');
        this.lobbyDiv = document.getElementById('lobby');
        this.enterRoomDiv = document.getElementById('enterRoom');
        this.roomCodeInput = document.getElementById('roomCode');
        this.playBtn = document.getElementById('playBtn');
        this.leaveBtn = document.getElementById('leaveBtn');
        
        // Sử dụng AudioManager toàn cục
        this.audioManager = window.audioManager;
        
        this.initEventListeners();
    }

    initEventListeners() {
        // Chuyển sang giao diện nhập mã
        this.enterBtn.addEventListener('click', () => {
            this.audioManager.playClick();
            const name = this.nameInput.value.trim();
            if (!name) {
                this.showAlert('Vui lòng nhập tên của bạn trước!');
                return;
            }
            this.switchToEnterRoom();
        });

        // Quay lại lobby
        this.leaveBtn.addEventListener('click', () => {
            this.audioManager.playClick();
            this.switchToLobby();
        });

        // Tạo phòng
        this.createBtn.addEventListener('click', () => {
            this.audioManager.playClick();
            const name = this.nameInput.value.trim();
            if (!name) {
                this.showAlert('Vui lòng nhập tên của bạn');
                return;
            }
            const code = this.generateRoomCode();
            this.goToRoom(name, code);
        });

        // Vào phòng bằng mã
        this.playBtn.addEventListener('click', () => {
            this.audioManager.playClick();
            const name = this.nameInput.value.trim();
            const code = this.roomCodeInput.value.trim().toUpperCase();
            if (!code) {
                this.showAlert('Vui lòng nhập mã phòng');
                return;
            }
            this.goToRoom(name, code);
        });

        // Enter key support
        this.nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.audioManager.playClick();
                this.enterBtn.click();
            }
        });

        this.roomCodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.audioManager.playClick();
                this.playBtn.click();
            }
        });
    }

    switchToEnterRoom() {
        this.lobbyDiv.classList.add('hidden');
        this.enterRoomDiv.classList.remove('hidden');
        this.roomCodeInput.focus();
    }

    switchToLobby() {
        this.enterRoomDiv.classList.add('hidden');
        this.lobbyDiv.classList.remove('hidden');
        this.nameInput.focus();
    }

    generateRoomCode() {
        return Math.random().toString(36).slice(2, 7).toUpperCase();
    }

    goToRoom(name, code) {
        const query = new URLSearchParams({ name, code });
        window.location.href = `room.html?${query.toString()}`;
    }

    showAlert(message) {
        // Tạo custom alert đẹp hơn
        const alertDiv = document.createElement('div');
        alertDiv.className = 'custom-alert';
        alertDiv.innerHTML = `
            <div class="alert-content">
                <i class="fa-solid fa-exclamation-triangle"></i>
                <p>${message}</p>
                <button class="alert-btn">OK</button>
            </div>
        `;
        
        document.body.appendChild(alertDiv);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.parentNode.removeChild(alertDiv);
            }
        }, 3000);
        
        // Manual close
        alertDiv.querySelector('.alert-btn').addEventListener('click', () => {
            if (alertDiv.parentNode) {
                alertDiv.parentNode.removeChild(alertDiv);
            }
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LobbyManager();
});
