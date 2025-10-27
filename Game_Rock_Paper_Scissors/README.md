# 🎮 Game Kéo Búa Bao Online

Một game Kéo Búa Bao đa người chơi với giao diện hiện đại và responsive, hỗ trợ cả desktop và mobile.

## ✨ Tính năng

- 🎯 **Game đa người chơi**: Chơi với bạn bè qua mạng
- 📱 **Responsive Design**: Hoạt động tốt trên cả desktop và mobile
- 🎵 **Âm thanh**: Nhạc nền và hiệu ứng âm thanh
- 💬 **Chat**: Trò chuyện trong khi chơi
- 🎨 **Giao diện đẹp**: Thiết kế hiện đại với animations
- 🌐 **Real-time**: Cập nhật kết quả theo thời gian thực

## 🚀 Cài đặt và chạy

### Yêu cầu
- Node.js (phiên bản 14 trở lên)
- npm hoặc yarn

### Cài đặt
```bash
# Di chuyển vào thư mục game
cd Game_Rock_Paper_Scissors

# Cài đặt dependencies
npm install

# Chạy server
npm start
```

### Truy cập game
Mở trình duyệt và truy cập: `http://localhost:4001`

## 🎮 Cách chơi

1. **Tạo phòng hoặc tham gia phòng**:
   - Nhập tên của bạn
   - Chọn "Tạo phòng" để tạo phòng mới
   - Hoặc chọn "Vào phòng" và nhập mã phòng

2. **Chơi game**:
   - Nhấn "Bắt đầu trận đấu" khi có 2 người chơi
   - Chọn Búa (✊), Bao (✋), hoặc Kéo (✌️)
   - Người thắng 3 ván sẽ thắng trận đấu

3. **Chat**:
   - Sử dụng khung chat để trò chuyện với đối thủ
   - Nhấn Enter hoặc nút gửi để gửi tin nhắn

## 🎵 Âm thanh

- **Nhạc nền**: Tự động phát khi bắt đầu game
- **Hiệu ứng**: Âm thanh khi click, thắng, thua, hòa
- **Điều khiển**: Nút bật/tắt âm thanh ở góc phải màn hình

## 📱 Responsive Design

Game được tối ưu cho:
- **Desktop**: Giao diện đầy đủ với tất cả tính năng
- **Tablet**: Layout điều chỉnh phù hợp
- **Mobile**: Giao diện tối ưu cho màn hình nhỏ

## 🛠️ Cấu trúc dự án

```
Game_Rock_Paper_Scissors/
├── server.js              # Server Node.js
├── package.json           # Dependencies
├── templates/             # Frontend files
│   ├── index.html         # Trang lobby
│   ├── room.html          # Trang game
│   ├── style/
│   │   ├── reset.css      # CSS reset
│   │   └── style.css      # CSS chính
│   ├── js/
│   │   ├── lobby.js       # Logic lobby
│   │   ├── audio.js       # Quản lý âm thanh
│   │   └── game.js        # Logic game
│   └── sounds/            # File âm thanh
│       ├── bg.mp3         # Nhạc nền
│       ├── click.mp3      # Âm thanh click
│       ├── win.mp3        # Âm thanh thắng
│       ├── lose.mp3       # Âm thanh thua
│       └── draw.mp3       # Âm thanh hòa
```

## 🎨 Tính năng giao diện

- **Glassmorphism**: Hiệu ứng kính mờ hiện đại
- **Gradients**: Màu sắc gradient đẹp mắt
- **Animations**: Hiệu ứng chuyển động mượt mà
- **Icons**: Font Awesome icons
- **Typography**: Font Poppins chuyên nghiệp

## 🔧 Tùy chỉnh

### Thay đổi âm thanh
Thay thế các file trong thư mục `sounds/`:
- `bg.mp3`: Nhạc nền
- `click.mp3`: Âm thanh click
- `win.mp3`: Âm thanh thắng
- `lose.mp3`: Âm thanh thua
- `draw.mp3`: Âm thanh hòa

### Thay đổi màu sắc
Chỉnh sửa CSS variables trong `style.css`:
```css
:root {
    --primary-color: #4ecdc4;
    --secondary-color: #ff6b6b;
    --accent-color: #45b7d1;
}
```

## 🐛 Xử lý lỗi

### Âm thanh không phát
- Đảm bảo trình duyệt cho phép autoplay
- Nhấn nút âm thanh để bật/tắt
- Kiểm tra file âm thanh có tồn tại không

### Kết nối bị lỗi
- Kiểm tra server có đang chạy không
- Đảm bảo port 4001 không bị chiếm dụng
- Kiểm tra firewall/antivirus

## 📄 License

MIT License - Tự do sử dụng và chỉnh sửa.

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Hãy tạo issue hoặc pull request.

---

**Chúc bạn chơi game vui vẻ! 🎉**
