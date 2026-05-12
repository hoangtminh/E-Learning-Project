# Báo Cáo Triển Khai Tính Năng Bài Tập (Assignments)

> **Ngày thực hiện:** 10/05/2026  
> **Dự án:** E-Learning Platform (NestJS + Next.js + Prisma + AWS S3 + TiDB)

---

## 1. Tổng Quan Mục Tiêu

Triển khai hệ thống quản lý bài tập hoàn chỉnh cho lớp học (Classroom), bao gồm:

- Giáo viên tạo/sửa/xóa bài tập, đính kèm file đề bài lên S3
- Học sinh nộp bài (text/link hoặc upload file trực tiếp lên S3)
- Admin/Owner xem danh sách bài nộp, download file, chấm điểm (0–100)
- Trang admin cho phép cả **Owner** lẫn **Admin** của classroom truy cập

---

## 2. Thay Đổi Database

### Schema Prisma (`backend/prisma/schema.prisma`)

#### Model `ClassroomTask` — thêm 2 field:

```prisma
attachmentKey  String?  @map("attachment_key")   // S3 key của file đề bài giáo viên
attachmentName String?  @map("attachment_name")  // Tên gốc của file đính kèm
```

#### Model `TaskSubmission` — giữ nguyên, tận dụng field có sẵn:

```prisma
fileUrl  String?  @map("file_url")   // Dùng để lưu S3 key của file bài nộp
```

### Migration

```bash
# Áp dụng schema trực tiếp lên TiDB Cloud (không reset data)
npx prisma db push

# Regenerate Prisma Client
npx prisma generate
```

---

## 3. Cấu Trúc Thư Mục S3

```
assignments/
├── {classroomId}/
│   ├── tasks/
│   │   └── {taskId}/
│   │       └── {uuid}-{filename}       ← File đề bài của giáo viên
│   └── submissions/
│       └── {taskId}/
│           └── {userId}/
│               └── {uuid}-{filename}   ← File bài nộp của học sinh
```

- **Storage class:** `INTELLIGENT_TIERING` (tự động tối ưu chi phí)
- **Presigned URL:** hết hạn sau **15 phút** (900 giây)

---

## 4. Thay Đổi Backend

### 4.1 DTOs

| File | Thay đổi |
|------|---------|
| `src/modules/tasks/dto/update-task.dto.ts` | **[MỚI]** DTO cho PATCH task, gồm: `title?`, `description?`, `deadline?`, `attachmentKey?`, `attachmentName?` |
| `src/modules/tasks/dto/submit-task.dto.ts` | Thêm `fileName?` (tên gốc file bài nộp) |

### 4.2 Service (`src/modules/tasks/tasks.service.ts`)

| Method | Mô tả | Auth |
|--------|-------|------|
| `findAll()` | Lấy danh sách bài tập, kèm bài nộp của user hiện tại | Member |
| `create()` | Tạo bài tập mới | Admin/Owner |
| `update()` | Sửa bài tập (title, desc, deadline, attachmentKey/Name) | Admin/Owner |
| `remove()` | Xóa bài tập (cascade xóa submissions) | Admin/Owner |
| `getTaskAttachmentPresignedUrl()` | Presigned PUT URL để giáo viên upload file đề | Admin/Owner |
| `getTaskAttachmentDownloadUrl()` | Presigned GET URL để tải file đề bài | Member |
| `getSubmissionPresignedUploadUrl()` | Presigned PUT URL để học sinh upload file bài nộp | Member |
| `getSubmissionDownloadUrl()` | Presigned GET URL tải file bài nộp của học sinh | Admin/Owner |
| `getOwnSubmissionDownloadUrl()` | Presigned GET URL để học sinh tải lại file của chính họ | Member |
| `submit()` | Nộp/cập nhật bài (upsert) | Member |
| `getSubmissions()` | Lấy tất cả bài nộp cho một task | Admin/Owner |
| `grade()` | Chấm điểm (0–100, Decimal) | Admin/Owner |

### 4.3 Controller (`src/modules/tasks/tasks.controller.ts`)

Tất cả routes prefix: `classrooms/:classroomId/tasks`

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/` | Danh sách bài tập |
| `POST` | `/` | Tạo bài tập |
| `PATCH` | `/:taskId` | **[MỚI]** Sửa bài tập |
| `DELETE` | `/:taskId` | Xóa bài tập |
| `GET` | `/:taskId/attachment/presigned-upload` | **[MỚI]** URL upload đề bài (admin) |
| `GET` | `/:taskId/attachment/download` | **[MỚI]** URL tải đề bài (all members) |
| `GET` | `/:taskId/submissions/presigned-upload` | **[MỚI]** URL upload bài nộp (student) |
| `POST` | `/:taskId/submit` | Nộp/cập nhật bài |
| `GET` | `/:taskId/submissions` | Danh sách bài nộp (admin) |
| `GET` | `/:taskId/submissions/:submissionId/download` | **[MỚI]** URL tải file bài nộp (admin) |
| `GET` | `/:taskId/my-submission/download` | **[MỚI]** URL tải file của chính mình (student) |
| `PATCH` | `/:taskId/submissions/:submissionId/grade` | Chấm điểm |

---

## 5. Thay Đổi Frontend

### 5.1 API Client (`frontend/src/api/classroom.ts`)

Thêm/sửa các hàm:

| Hàm | Mô tả |
|-----|-------|
| `updateTask()` | Gọi PATCH, hỗ trợ `attachmentKey`, `attachmentName` |
| `getTaskAttachmentPresignedUpload()` | Lấy URL upload đề bài |
| `getTaskAttachmentDownloadUrl()` | Lấy URL tải đề bài |
| `getSubmissionPresignedUpload()` | Lấy URL upload bài nộp |
| `getSubmissionDownloadUrl()` | Admin tải file bài nộp |
| `getMySubmissionDownloadUrl()` | Student tải lại file của mình |
| `ClassroomTask` type | Thêm `attachmentKey`, `attachmentName` |

### 5.2 Context (`frontend/src/contexts/TaskContext.tsx`)

Viết lại hoàn toàn với đầy đủ type safety và các action mới:

- `createTask`, `updateTask`, `deleteTask`, `submitTask`
- `getTaskAttachmentPresignedUpload`, `getTaskAttachmentDownloadUrl`
- `getSubmissionPresignedUpload`, `getSubmissionDownloadUrl`, `getMySubmissionDownloadUrl`
- `getSubmissions` — trả về `SubmissionWithUser[]` (kèm thông tin user)
- `gradeSubmission`

### 5.3 Layout (`frontend/src/app/(main)/classrooms/[classroomId]/layout.tsx`)

**Sửa quyền truy cập trang Admin:** trước đây chỉ `owner`, nay cả `admin` của classroom cũng thấy nút **Dashboard Admin**.

```ts
// Trước:
const isOwner = currentUserId === classroom.ownerId;

// Sau:
const currentMember = classroom.members?.find((m) => m.userId === currentUserId);
const isOwnerOrAdmin = isOwner || currentMember?.role === 'admin' || currentMember?.role === 'owner';
```

### 5.4 Admin UI (`frontend/src/app/(main)/classrooms/[classroomId]/admin/tasks/page.tsx`)

Viết lại hoàn toàn với giao diện **split-panel**:

**Panel trái — Danh sách bài tập:**
- Hiển thị số lượng bài nộp, deadline
- Nút **Sửa** (mở modal edit) và **Xóa** (có confirm)
- Border trái highlight task đang chọn

**Panel phải — Bài nộp của task đã chọn:**
- Thống kê: tổng nộp, đã chấm, chưa chấm
- Card từng học sinh: avatar, tên, thời gian nộp
- Nội dung text bài làm (scrollable)
- Nút **Tải file bài nộp** (presigned download)
- Input điểm (0–100) + nút **Chấm điểm** / **Cập nhật**

**Modal Tạo/Sửa bài tập:**
- Fields: Tiêu đề, Mô tả/Đề bài, Hạn nộp, File đính kèm đề bài
- Upload file đề bài: drag-zone → presigned PUT → lưu S3 key vào DB
- Khi tạo task mới có file: create task → upload → update attachment

### 5.5 Student UI (`frontend/src/app/(main)/classrooms/[classroomId]/tasks/page.tsx`)

Viết lại hoàn toàn với layout 2 cột:

**Danh sách bài tập (cột chính):**
- Card có border trái màu theo urgency (đỏ nếu sắp hạn, xanh bình thường)
- Badge trạng thái: Chưa làm / Đã nộp–chờ chấm / Đã chấm điểm (kèm điểm số lớn)
- Bấm tên task → expand card xem chi tiết

**Expanded detail:**
- Nội dung đề bài đầy đủ
- Nút **Tải file đề bài** (nếu giáo viên đính kèm)
- Bài nộp hiện tại (text + nút tải file)

**Modal Nộp bài (2 tab):**
- Tab **Nội dung/Link**: textarea dán link hoặc nhập nội dung
- Tab **Upload File**: drag-zone chọn file → upload thẳng lên S3 với progress bar → lưu S3 key

**Sidebar:**
- Progress bar tiến độ hoàn thành
- Thống kê Cần làm / Đã nộp
- Danh sách bài sắp tới hạn

---

## 6. Luồng Upload File (Client-side S3 Upload)

```
[Frontend]                    [Backend]                    [S3]
    |                             |                          |
    |-- GET presigned-upload ---> |                          |
    |                             |-- generate presigned --> |
    |<-- { url, s3Key } ---------|                          |
    |                             |                          |
    |-- PUT file directly ------> | (skip backend)  ------> |
    |                             |                          |
    |-- POST /submit { fileUrl: s3Key } --> |               |
    |                             |-- save to DB ----------> |
```

---

## 7. Các File Đã Thay Đổi

### Backend

```
backend/
├── prisma/
│   └── schema.prisma                          ← Thêm attachmentKey, attachmentName vào ClassroomTask
└── src/modules/tasks/
    ├── dto/
    │   ├── update-task.dto.ts                 ← [MỚI]
    │   └── submit-task.dto.ts                 ← Thêm fileName
    ├── tasks.service.ts                       ← Viết lại hoàn toàn
    └── tasks.controller.ts                    ← Viết lại hoàn toàn
```

### Frontend

```
frontend/src/
├── api/
│   └── classroom.ts                           ← Thêm 6 hàm mới, cập nhật types
├── contexts/
│   └── TaskContext.tsx                        ← Viết lại hoàn toàn
└── app/(main)/classrooms/[classroomId]/
    ├── layout.tsx                             ← isOwner → isOwnerOrAdmin
    ├── admin/tasks/
    │   └── page.tsx                           ← Viết lại: split-panel, submissions, grading
    └── tasks/
        └── page.tsx                           ← Viết lại: upload S3, expand card, attachment download
```

---

## 8. Lưu Ý Khi Deploy

### Biến môi trường Backend (`.env`)

```env
AWS_S3_BUCKET_NAME=your-bucket-name
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

### CORS S3 Bucket

Cần cấu hình CORS cho bucket để cho phép `PUT` từ frontend:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT"],
    "AllowedOrigins": ["https://your-frontend-domain.com"],
    "ExposeHeaders": []
  }
]
```

---

## 9. Tính Năng Không Triển Khai (Do Constraint DB)

Ban đầu giáo viên attachment được thiết kế có `fileKey` riêng trong `TaskSubmission`, nhưng sau khi thêm `attachmentKey`/`attachmentName` vào `ClassroomTask` (đã được user approve và push DB), tính năng này **đã hoàn chỉnh**.

> **Không có tính năng nào bị bỏ lại.** Tất cả đều được triển khai đầy đủ.

---

## 10. Kết Quả Kiểm Tra

```bash
# Backend TypeScript check
cd backend && npx tsc --noEmit
# → 0 errors ✅

# Frontend TypeScript check  
cd frontend && npx tsc --noEmit
# → 0 errors ✅

# Database sync
npx prisma db push
# → 🚀 Your database is now in sync with your Prisma schema ✅
```
