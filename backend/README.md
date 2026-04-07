# E-Learning Project - Backend

Đây là mã nguồn backend cho dự án E-Learning. Dự án được xây dựng dựa trên
framework [NestJS](https://nestjs.com/), sử dụng
[Prisma ORM](https://www.prisma.io/) để tương tác với cơ sở dữ liệu
[PostgreSQL](https://www.postgresql.org/).

## 📋 Yêu cầu hệ thống

Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt các phần mềm sau:

- [Node.js](https://nodejs.org/) (Khuyến nghị phiên bản 18.x hoặc mới hơn)
- [npm](https://www.npmjs.com/) (thường đi kèm với Node.js) hoặc
  [Yarn](https://yarnpkg.com/)/[pnpm](https://pnpm.io/)
- [PostgreSQL](https://www.postgresql.org/) (Đang chạy ở local hoặc trên cloud)

## 🚀 Hướng dẫn cài đặt và khởi chạy

### 1. Cài đặt các gói phụ thuộc (Dependencies)

Mở terminal, đảm bảo bạn đang ở trong thư mục `backend`, sau đó chạy lệnh sau để
cài đặt các thư viện cần thiết:

```bash
npm install
# hoặc
yarn install
```

### 2. Cấu hình biến môi trường

Tạo một file `.env` ở thư mục gốc của `backend`. Bạn có thể sao chép từ file mẫu
`.env.example` (nếu có):

```bash
cp .env.example .env
```

Mở file `.env` và cập nhật lại chuỗi kết nối cơ sở dữ liệu PostgreSQL cho phù
hợp với máy của bạn. Ví dụ:

# Port chạy server (mặc định thường là 3000)

PORT=3000

`````

### 3. Thiết lập Cơ sở dữ liệu (Prisma)

Sau khi đã cấu hình xong `DATABASE_URL`, bạn cần chạy các lệnh Prisma để đồng bộ
cấu trúc database và tạo Prisma Client:

````bash
# Chạy migration để tự động tạo các bảng trong database PostgreSQL
npx prisma migrate dev (Không cần)

# Generate lại mã Prisma Client
npx prisma generate

### 4. Chạy ứng dụng

```bash
# Chạy môi trường phát triển (tự động reload khi có thay đổi code)
npm run start:dev

Khi terminal hiển thị thông báo thành công, API server sẽ chạy tại địa chỉ:
`http://localhost:3000` (hoặc theo port bạn cấu hình).
`````
