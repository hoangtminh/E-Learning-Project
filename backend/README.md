# Glacier Learn - Backend

Hệ thống API và Real-time cho nền tảng Glacier Learn, được xây dựng trên nền tảng NestJS mạnh mẽ và Prisma ORM.

## 🚀 Hướng dẫn khởi chạy

### 1. Cài đặt Dependencies
```bash
npm install
```

### 2. Cấu hình môi trường
Tạo file `.env` tại thư mục gốc của `backend` và cấu hình chuỗi kết nối Database (MySQL):
```env
DATABASE_URL="mysql://user:password@localhost:3306/glacier_db"
JWT_SECRET="your_secret_key"
```

### 3. Khởi tạo Database (Prisma)
Đồng bộ schema và tạo Prisma Client:
```bash
npx prisma generate
```

### 4. Chạy ứng dụng
```bash
# Môi trường phát triển
npm run start:dev
```
API server sẽ chạy tại: [http://localhost:3001](http://localhost:3001) (hoặc port được cấu hình).

---

## 📁 Cấu trúc thư mục (Folder Structure)

Dự án được tổ chức theo module của NestJS:

- **`src/auth`**: Xử lý xác thực (Login, Register, JWT Strategy).
- **`src/modules`**: Các module nghiệp vụ chính.
    - `courses/`: Quản lý khóa học.
    - `sections/` & `lessons/`: Quản lý nội dung bài học.
    - `classrooms/`: Quản lý lớp học ảo.
    - `chat/`: Xử lý tin nhắn và hội thoại.
- **`src/socket`**: Xử lý WebSockets.
    - `webrtc.gateway.ts`: Xử lý signaling cho gọi video/audio (WebRTC).
    - `socket.module.ts`: Cấu hình chung cho WebSocket.
- **`src/prisma`**: Kết nối và quản lý Prisma Service.
- **`src/common`**: Chứa các thành phần dùng chung toàn hệ thống.
    - `guards/`: Bảo vệ route (ví dụ: `JwtAuthGuard`).
    - `decorators/`: Các decorator tùy chỉnh (ví dụ: `@Public()`).
    - `filters/`: Xử lý lỗi tập trung.

---

## 🛠 Hướng dẫn phát triển (Development)

### Nguyên tắc chung
1. **Module-based**: Mỗi tính năng mới nên được tách thành một module riêng trong `src/modules`.
2. **Security**: Mặc định tất cả các route đều được bảo vệ bởi `JwtAuthGuard`. Sử dụng decorator `@Public()` cho các API không cần đăng nhập.
3. **Database**: Sử dụng `PrismaService` để tương tác với DB. Luôn đảm bảo `schema.prisma` được cập nhật index cho các quan hệ khi sử dụng `relationMode = "prisma"`.

### Thêm tính năng mới
- **Tạo module**: `nest generate module modules/feature_name`.
- **Real-time**: Nếu cần thêm sự kiện socket mới, hãy cập nhật trong `WebrtcGateway` hoặc tạo Gateway mới trong `src/socket`.
- **Schema**: Sau khi sửa `schema.prisma`, nhớ chạy `npx prisma generate`.

### Công nghệ sử dụng
- **Framework**: NestJS
- **ORM**: Prisma (MySQL)
- **Real-time**: Socket.io (WebSockets)
- **Auth**: JWT (Passport.js)
