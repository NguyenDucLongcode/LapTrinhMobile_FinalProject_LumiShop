
```markdown
# AI_LOG.md - Nhật ký sử dụng AI (Antigravity)


Dưới đây là nhật ký quá trình sử dụng AI để hỗ trợ xây dựng dự án Study Planner, tuân thủ quy định của môn học.

### 1. Giai đoạn: Khởi tạo dự án và chuyển đổi từ LumiShop sang Study Planner
- **Prompt:** "Hãy tái cấu trúc dự án từ Web Bán Hàng sang Study Planner (Quản lý lịch học). Đổi Product -> Assignment, Category -> Course."
- **Chấp nhận:** AI đã tạo thành công các file `courses.json`, `assignments.json`, và cập nhật API Layer rất nhanh.
- **Từ chối:** AI đề xuất dùng `db.json` gộp chung, tôi từ chối vì muốn tách file JSON riêng để dễ quản lý (đúng kiến trúc 4 tầng).

### 2. Giai đoạn: Sửa lỗi Routing
- **Prompt:** "Lỗi 'The action GO_BACK was not handled'. Hãy sửa toàn bộ nút Back trên app."
- **Chấp nhận:** AI sử dụng `router.canGoBack()` để kiểm tra trước khi gọi `router.back()`. Cách này giúp app không bị crash.
- **Từ chối:** AI đề xuất xóa hết các nút Back, tôi từ chối vì làm vậy app sẽ khó điều hướng.

### 3. Giai đoạn: Xử lý ảnh (Image)
- **Prompt:** "Ảnh bị mất khi reload. Hãy lưu ảnh vĩnh viễn trên cả Web và Mobile."
- **Chấp nhận:** AI dùng Base64 cho Web và `FileSystem.documentDirectory` cho Mobile. Cách này giải quyết triệt để lỗi mất ảnh.
- **Từ chối:** AI đề xuất chỉ lưu URL từ internet, tôi từ chối vì đề bài yêu cầu chụp ảnh trực tiếp từ thiết bị.

### 4. Giai đoạn: Phân quyền Admin/User
- **Prompt:** "Phân quyền cho Admin và Student. Admin được thêm/sửa/xóa, Student chỉ xem."
- **Chấp nhận:** AI dùng `useAuthStore` để kiểm tra role và ẩn/hiện các nút bấm.
- **Từ chối:** AI đề xuất tạo thêm chức năng "Quản lý User", tôi từ chối vì đề bài không yêu cầu.

### 5. Giai đoạn: Sửa lỗi TypeScript và đồng bộ Type
- **Prompt:** "File types bị lộn xộn, có chỗ dùng 'customer' thay vì 'student'. Hãy kiểm tra và sửa lại toàn bộ."
- **Chấp nhận:** AI đã quét toàn bộ và sửa lại, giúp `npx tsc --noEmit` trả về 0 lỗi.
- **Từ chối:** Không có.