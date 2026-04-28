# Glacier Learn - Frontend

Glacier Learn là nền tảng E-Learning hiện đại dành cho giảng viên và học viên, được xây dựng với trải nghiệm người dùng mượt mà và các tính năng tương tác thời gian thực.

## 🚀 Hướng dẫn khởi chạy

### 1. Cài đặt Dependencies
Đảm bảo bạn đã cài đặt Node.js (phiên bản 18+).
```bash
npm install
```

### 2. Biến môi trường (Environment Variables)
Tạo file `.env.local` nếu cần thiết (mặc định frontend kết nối tới backend tại `http://localhost:3001`).

### 3. Chạy môi trường phát triển
```bash
npm run dev
```
Ứng dụng sẽ chạy tại địa chỉ: [http://localhost:3000](http://localhost:3000)

---

## 📁 Cấu trúc thư mục (Folder Structure)

Dự án sử dụng Next.js App Router:

- **`src/app`**: Chứa các route và trang của ứng dụng (Dashboard, Call, Courses, Auth).
- **`src/components`**: Các thành phần giao diện dùng chung và theo module.
    - `ui/`: Các component nền tảng (button, card, input...) từ shadcn/ui.
    - `dashboard/`: Các thành phần cho trang quản lý.
    - `call/`: Các thành phần cho module họp trực tuyến/học online.
- **`src/contexts`**: Quản lý trạng thái toàn cục (Global State).
    - `AuthContext`: Quản lý đăng nhập/người dùng.
    - `CallContext`: Xử lý WebRTC, Socket.io cho phòng họp.
    - `CourseContext`: Quản lý dữ liệu khóa học.
- **`src/api`**: Các hàm gọi API backend (axios instance, services).
- **`src/lib`**: Các hàm tiện ích (utils), constants và config.
- **`src/hooks`**: Các custom hooks dùng chung.

---

## 🛠 Hướng dẫn phát triển (Development)

### Nguyên tắc chung
1. **Thẩm mỹ (Aesthetics)**: Luôn ưu tiên giao diện đẹp, hiện đại (sử dụng glassmorphism, gradient, và framer-motion cho animation).
2. **Component-based**: Chia nhỏ UI thành các component tái sử dụng được.
3. **Context Usage**: 
    - Để lấy thông tin cuộc gọi/họp: sử dụng `useCallContext()`.
    - Để lấy dữ liệu khóa học: sử dụng `useCourses()`.
    - Để lấy thông tin người dùng: sử dụng `useAuth()`.

### Thêm tính năng mới
- **Trang mới**: Tạo thư mục mới trong `src/app`.
- **API mới**: Định nghĩa endpoint trong `src/api` tương ứng với backend.
- **Real-time**: Sử dụng `socketRef` trong `CallContext` nếu cần thêm các sự kiện socket mới.

### Công nghệ sử dụng
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Icons**: Google Material Symbols & Lucide React
- **Real-time**: Socket.io Client
- **Video/Audio**: WebRTC (Peer-to-peer)
