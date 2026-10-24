# 📚 Study Planner - Ứng dụng Quản lý Lịch học & Bài tập

## 📌 Giới thiệu
Đây là ứng dụng di động (Expo React Native) giúp sinh viên quản lý môn học, bài tập và hạn chót. Dự án được thực hiện cho môn **Lập trình Mobile** (Topic 01 - Study Planner).

## 🚀 Công nghệ sử dụng
- **Framework:** Expo SDK 56+, React Native, TypeScript.
- **Routing:** Expo Router (File-based routing).
- **State Management:** Zustand (Quản lý Auth), TanStack Query (Quản lý Data).
- **Local Storage:** AsyncStorage (Cache), SecureStore (Lưu Token), FileSystem (Lưu ảnh).
- **Mock API:** JSON Server (Node.js).

## 📂 Cấu trúc thư mục
```text
StudyPlanner_App/
├── app/                    # Chứa các màn hình (Expo Router)
│   ├── (auth)/             # Màn hình đăng nhập
│   ├── (app)/              # Màn hình chính (đã đăng nhập)
│   │   ├── (tabs)/         # Các tab: Trang chủ, Lịch tuần, Admin
│   │   ├── assignment/     # Chi tiết & Tạo bài tập (Modal)
│   └── +not-found.tsx      # Trang 404
├── api/                    # Tầng API (Axios)
├── hooks/                  # Tầng TanStack Query (Custom Hooks)
├── store/                  # Zustand Store (Auth)
├── data/                   # Database JSON (courses, assignments, users)
├── types/                  # Định nghĩa Interface TypeScript
├── theme/                  # Cấu hình màu sắc, Style
├── utils/                  # Hàm tiện ích (Xử lý ngày tháng, ảnh)
├── server.cjs              # Server giả lập (đọc/ghi file JSON)
└── package.json
⚙️ Hướng dẫn cài đặt & Chạy dự án
1. Cài đặt thư viện:

bash
npm install
2. Chạy Mock Server (Terminal 1):

bash
npm run server
(Server sẽ chạy ở cổng 3000 và ghi trực tiếp vào các file JSON trong thư mục data/)

3. Chạy Ứng dụng (Terminal 2):

bash
npx expo start --web --clear
Nhấn w để mở trên trình duyệt Web.

Quét mã QR bằng app Expo Go để chạy trên điện thoại.

🔑 Tài khoản thử nghiệm
Admin (Quản trị viên): Username: admin | Password: admin

Student (Sinh viên): Username: user | Password: 123

🎯 Các chức năng chính
☑ Đăng nhập / Đăng xuất, lưu session an toàn (SecureStore).
☑ CRUD Môn học & Bài tập (Dành riêng cho Admin).
☑ Xem danh sách, lọc theo môn học, tìm kiếm bài tập.
☑ Lịch tuần (Weekly View) với các chấm màu tương ứng môn học.
☑ Đính kèm ảnh (Chụp từ camera hoặc thư viện), nén ảnh và lưu vĩnh viễn.
☑ Xử lý Timezone an toàn (dùng date-fns) để tính chính xác thời gian còn lại.
☑ Phân quyền Admin/Student triệt để (ẩn/hiện các nút chức năng).
☑ Hoạt động Offline (hiển thị dữ liệu cache kèm banner).
☑ Deep Link (Click thông báo mở thẳng chi tiết bài tập).