# REFLECTION.md - Bài thu hoạch cá nhân (1 trang)


## 1. Điều tôi sẽ làm khác đi nếu được làm lại dự án
Nếu có cơ hội làm lại, tôi sẽ **dành nhiều thời gian hơn cho việc thiết kế Database (JSON) và viết Types từ đầu**. Ban đầu, tôi tái sử dụng code từ dự án cũ (Web bán hàng), dẫn đến việc các trường dữ liệu bị lộn xộn (ví dụ: dùng `customer` thay vì `student`). Việc này khiến tôi phải mất gần 1 ngày để "đi audit" và sửa lại toàn bộ Types. 

Thêm vào đó, tôi sẽ **ưu tiên làm phần Offline và Sync Queue sớm hơn**. Tôi đã dồn việc này xuống cuối tuần thứ 2, khiến thời gian bị áp lực và khó test kỹ các trạng thái mạng chập chờn.

## 2. Một điều AI (Antigravity) đã làm sai mà tôi phát hiện
Trong quá trình làm phần **Lịch tuần (Weekly View)**, AI đã sử dụng thư viện `react-native-calendars` nhưng lại **để chấm màu (dot) quá nhỏ**, khiến người dùng khó nhìn thấy trên màn hình lớn. Tôi đã phải yêu cầu AI viết lại `dayComponent` để vẽ hình tròn với kích thước 8x8 thay vì dùng chấm mặc định của thư viện.

Một lỗi khác là **tự động điền (auto-fill) ở trang Đăng nhập**. Mặc dù tôi đã yêu cầu xóa `value`, AI vẫn để trình duyệt Chrome tự động điền mật khẩu. Cuối cùng, tôi phải yêu cầu AI thêm `autoComplete="off"` và đổi `name` của input thành tên lạ thì mới khắc phục được triệt để.

## 3. Kết luận
Dự án đã giúp tôi hiểu rõ hơn về **kiến trúc 4 tầng** (Data -> API -> Query -> UI) và cách xử lý các vấn đề thực tế khi lập trình Mobile như: lưu ảnh vĩnh viễn, xử lý múi giờ, phân quyền người dùng, và tối ưu UI/UX.