# Ý Tưởng Nâng Cấp Giao Diện Chi Tiết Khóa Học (Course Detail)

## 1. Phần "Tổng quan" (Overview)
- **Vấn đề hiện tại:** Đang sử dụng text tĩnh cơ bản (`description`).
- **Giải pháp:** 
  - Tích hợp Rich Text Editor (như React Quill, TinyMCE, hoặc MD Editor) vào trang **Instructor Studio** (phần chỉnh sửa khóa học).
  - Giảng viên có thể format text, chèn ảnh, list, bôi đậm. Hệ thống lưu dưới dạng HTML/Markdown vào field `description`.
  - Ở Frontend (Course Detail), dùng `dangerouslySetInnerHTML` để render lại đoạn mã HTML này một cách đẹp mắt.

## 2. Phần "Giảng viên" (Instructor)
- **Vấn đề hiện tại:** Fix cứng lấy thông tin từ user tạo khóa học (chưa linh hoạt nếu có nhiều giảng viên).
- **Giải pháp:**
  - *Mức độ cơ bản:* Lấy trực tiếp từ Profile (Tên, Avatar, Bio) của người tạo. Nếu muốn đổi thì vào Settings tài khoản.
  - *Mức độ nâng cao:* Thêm bảng trung gian `CourseInstructors` (n-n) trong DB. Tạo giao diện ở Studio cho phép "Mời giảng viên khác". Trang chi tiết sẽ map qua danh sách này để render nhiều giảng viên cùng lúc.

## 3. Phần "Đánh giá" (Reviews/Ratings)
- **Vấn đề hiện tại:** Điểm đánh giá (Rating) đang bị hardcode hoặc chưa phản ánh dữ liệu thực tế.
- **Giải pháp:**
  - *Database:* Tạo bảng `CourseReview` gồm các trường `id`, `courseId`, `userId`, `rating` (1-5 sao), `comment` (nội dung), `createdAt`.
  - *Điều kiện review:* 
    - Frontend chỉ hiển thị form đánh giá nếu user hiện tại đang login và đã **Enroll (đăng ký)** khóa học đó. (Role học sinh).
    - API Backend cần chặn (Guard) những user chưa mua/chưa đăng ký khóa học nhằm tránh spam đánh giá ảo.
    - Mỗi user chỉ được đánh giá 1 lần (nếu đánh giá lại sẽ là cập nhật (Update) lại rating cũ).
  - *Tính toán trung bình:* 
    - Có thể tính rating trung bình mỗi lần load khóa học bằng Prisma (`db.courseReview.aggregate({ _avg: { rating: true } })`).
    - Hoặc tối ưu hơn: Thêm trường `averageRating` và `reviewCount` vào bảng `Course`. Mỗi khi có review mới được tạo/sửa/xóa, dùng Prisma Trigger hoặc Middleware để update lại 2 trường này, giúp việc query trang chủ nhanh hơn rất nhiều.
  - *Giao diện:* Thêm thanh Progress Bar hiển thị tỉ lệ phần trăm số người vote 5 sao, 4 sao, 3 sao... giống như các sàn TMĐT. Lọc comment theo số sao.
