// 🎵 Audio Manager - Quản lý âm thanh
class AudioManager {
    constructor() {
        this.sounds = {
            bg: new Audio("sounds/bg.mp3"),
            click: new Audio("sounds/click.mp3"),
            win: new Audio("sounds/win.mp3"),
            lose: new Audio("sounds/lose.mp3"),
            draw: new Audio("sounds/draw.mp3")
        };
        
        this.soundEnabled = true; // Tự động bật âm thanh
        this.audioInitialized = false;
        this.firstInteraction = true;
        
        this.setupAudioEvents();
        this.initAudio();
        this.setupEventListeners();
        
        // Tự động bật âm thanh ngay lập tức
        setTimeout(() => {
            this.enableSound();
        }, 100);
        
        // Thử bật âm thanh khi user tương tác lần đầu
        document.addEventListener('click', () => {
            if (!this.soundEnabled) {
                this.enableSound();
            }
        }, { once: true });
        
        document.addEventListener('keydown', () => {
            if (!this.soundEnabled) {
                this.enableSound();
            }
        }, { once: true });
    }

    setupAudioEvents() {
        // Debug audio loading
        Object.entries(this.sounds).forEach(([name, audio]) => {
            audio.addEventListener('loadstart', () => {
                console.log(`🎵 Loading ${name} sound...`);
            });
            
            audio.addEventListener('canplaythrough', () => {
                console.log(`✅ ${name} sound loaded successfully`);
            });
            
            audio.addEventListener('error', (e) => {
                console.error(`❌ Error loading ${name} sound:`, e);
            });
        });
    }

    initAudio() {
        if (this.audioInitialized) return;
        
        // Cấu hình âm lượng
        this.sounds.bg.volume = 0.3;
        this.sounds.click.volume = 0.5;
        this.sounds.win.volume = 0.5;
        this.sounds.lose.volume = 0.5;
        this.sounds.draw.volume = 0.5;
        
        // Lặp nhạc nền
        this.sounds.bg.loop = true;
        
        // Preload audio files
        Object.values(this.sounds).forEach(audio => {
            audio.preload = 'auto';
            audio.load();
        });
        
        this.audioInitialized = true;
        console.log("✅ Audio initialized!");
    }

    setupEventListeners() {
        // Tự động bật âm thanh ngay lập tức
        this.enableSound();
        
        // Khởi tạo audio khi có tương tác đầu tiên (backup)
        document.body.addEventListener("click", () => {
            if (this.firstInteraction) {
                this.enableSound();
                this.firstInteraction = false;
                this.hideAutoplayMessage();
            }
        }, { once: true });

        // Toggle âm thanh
        const soundToggle = document.getElementById("soundToggle");
        if (soundToggle) {
            soundToggle.addEventListener("click", () => {
                this.toggleSound();
            });
        }

        // Test âm thanh
        const testSound = document.getElementById("testSound");
        if (testSound) {
            testSound.addEventListener("click", () => {
                this.testAllSounds();
            });
        }
    }

    enableSound() {
        if (this.soundEnabled && this.audioInitialized) {
            this.sounds.bg.play()
                .then(() => {
                    this.updateSoundToggleIcon();
                    console.log("🔊 Sound enabled and background music started!");
                    this.showSoundEnabledMessage();
                })
                .catch(err => {
                    console.warn("⚠️ Cannot autoplay music:", err.message);
                    // Nếu không thể autoplay, chờ user interaction
                    this.soundEnabled = false;
                    this.updateSoundToggleIcon();
                    // Chỉ hiển thị thông báo nếu thực sự cần
                    if (err.name === 'NotAllowedError') {
                        this.showAutoplayMessage();
                    }
                });
        }
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        
        if (this.soundEnabled) {
            this.playBgMusic();
            console.log("🔊 Sound ON");
        } else {
            this.sounds.bg.pause();
            console.log("🔇 Sound OFF");
        }
        
        this.updateSoundToggleIcon();
    }

    updateSoundToggleIcon() {
        const soundToggle = document.getElementById("soundToggle");
        if (soundToggle) {
            const icon = this.soundEnabled ? 
                '<i class="fa-solid fa-volume-high"></i>' : 
                '<i class="fa-solid fa-volume-xmark"></i>';
            soundToggle.innerHTML = icon;
        }
    }

    playBgMusic() {
        if (!this.soundEnabled || !this.audioInitialized) return;
        
        this.sounds.bg.play().catch(e => {
            console.log("⚠️ Could not play background music:", e.message);
        });
    }

    playSound(soundName) {
        if (!this.soundEnabled || !this.audioInitialized) return;
        
        const sound = this.sounds[soundName];
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(e => {
                console.log(`⚠️ Could not play ${soundName} sound:`, e.message);
            });
        }
    }

    // Các method tiện ích
    playClick() { this.playSound('click'); }
    playWin() { this.playSound('win'); }
    playLose() { this.playSound('lose'); }
    playDraw() { this.playSound('draw'); }

    // Dừng tất cả âm thanh
    stopAllSounds() {
        Object.values(this.sounds).forEach(sound => {
            sound.pause();
            sound.currentTime = 0;
        });
    }

    // Kiểm tra trạng thái âm thanh
    isSoundEnabled() {
        return this.soundEnabled;
    }

    // Test tất cả âm thanh
    testAllSounds() {
        console.log("🧪 Testing all sounds...");
        
        // Bật âm thanh nếu chưa bật
        if (!this.soundEnabled) {
            this.soundEnabled = true;
            this.updateSoundToggleIcon();
        }
        
        // Test từng âm thanh
        const sounds = ['click', 'win', 'lose', 'draw'];
        sounds.forEach((soundName, index) => {
            setTimeout(() => {
                console.log(`🔊 Testing ${soundName} sound...`);
                this.playSound(soundName);
            }, index * 1000);
        });
        
        // Test nhạc nền cuối cùng
        setTimeout(() => {
            console.log("🎵 Testing background music...");
            this.playBgMusic();
        }, sounds.length * 1000);
    }

    // Hiển thị thông báo autoplay
    showAutoplayMessage() {
        const message = document.createElement('div');
        message.id = 'autoplay-message';
        message.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 107, 107, 0.9);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            font-weight: 600;
            z-index: 10000;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 2px solid rgba(255, 255, 255, 0.2);
            animation: slideDown 0.3s ease;
        `;
        message.innerHTML = `
            <i class="fa-solid fa-volume-xmark"></i>
            Nhấn vào bất kỳ đâu để bật âm thanh
        `;
        
        // Thêm CSS animation
        if (!document.getElementById('autoplay-styles')) {
            const style = document.createElement('style');
            style.id = 'autoplay-styles';
            style.textContent = `
                @keyframes slideDown {
                    from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
                    to { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(message);
        
        // Tự động ẩn sau 5 giây
        setTimeout(() => {
            this.hideAutoplayMessage();
        }, 5000);
    }

    // Ẩn thông báo autoplay
    hideAutoplayMessage() {
        const message = document.getElementById('autoplay-message');
        if (message) {
            message.remove();
        }
    }

    // Hiển thị thông báo âm thanh đã bật
    showSoundEnabledMessage() {
        const message = document.createElement('div');
        message.id = 'sound-enabled-message';
        message.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(78, 205, 196, 0.9);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            font-weight: 600;
            z-index: 10000;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 2px solid rgba(255, 255, 255, 0.2);
            animation: slideDown 0.3s ease;
        `;
        message.innerHTML = `
            <i class="fa-solid fa-volume-high"></i>
            Âm thanh đã được bật tự động!
        `;
        
        document.body.appendChild(message);
        
        // Tự động ẩn sau 3 giây
        setTimeout(() => {
            this.hideSoundEnabledMessage();
        }, 3000);
    }

    // Ẩn thông báo âm thanh đã bật
    hideSoundEnabledMessage() {
        const message = document.getElementById('sound-enabled-message');
        if (message) {
            message.remove();
        }
    }
}

// Tạo instance duy nhất để sử dụng toàn cục
window.audioManager = new AudioManager();
console.log("🎵 Global AudioManager created!");

// Export để sử dụng trong các file khác
window.AudioManager = AudioManager;
