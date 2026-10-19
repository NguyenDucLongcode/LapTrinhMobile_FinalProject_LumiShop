# 🛍️ LumiShop - Ứng Dụng Bán Hàng Online (Cross-Platform)

Chào mừng các thành viên nhóm đến với dự án **LumiShop**! Đây là ứng dụng bán hàng online được xây dựng bằng **Expo (React Native)**, có khả năng chạy mượt mà trên cả **Mobile (iOS/Android)** và **Web (Trình duyệt)**. 

Dự án này được thực hiện cho bài thi cuối kỳ môn **Lập trình Mobile**, kết hợp ý tưởng nghiệp vụ từ môn **Phân tích thiết kế hệ thống**.

---

## 🚀 1. Công Nghệ Sử Dụng (Tech Stack)

Để đảm bảo tính hiện đại và hiệu suất, nhóm đã thống nhất sử dụng các công nghệ sau:
- **Framework:** Expo (React Native) + TypeScript.
- **Routing:** Expo Router (File-based routing).
- **Quản lý dữ liệu (Data Fetching):** TanStack Query (React Query v5) + Axios.
- **Quản lý trạng thái (State Management):** Zustand (có tích hợp Persist).
- **Lưu trữ cục bộ:** AsyncStorage (Mobile & Web) và SecureStore (Mobile - có fallback Web).
- **Giao diện (UI):** React Native StyleSheet tùy chỉnh (Modern UI, Gradient, Glassmorphism).
- **Mock API:** JSON Server (giả lập Backend).

---

## 📂 2. Cấu Trúc Thư Mục Dự Án

Để cả nhóm dễ làm việc, không bị sửa nhầm file của nhau, cấu trúc thư mục được quy định như sau:

```text
LumiShop/
├── app/                    # Chứa toàn bộ các màn hình (Expo Router)
│   ├── (auth)/             # Nhóm màn hình chưa đăng nhập
│   │   └── sign-in.tsx     # Màn hình Đăng nhập
│   ├── (app)/              # Nhóm màn hình đã đăng nhập (được bảo vệ)
│   │   ├── _layout.tsx     # Layout chung (Bottom Tabs / Stack)
│   │   ├── index.tsx       # Trang chủ (Danh sách sản phẩm)
│   │   ├── product/[id].tsx# Chi tiết sản phẩm
│   │   ├── cart.tsx        # Giỏ hàng
│   │   ├── checkout.tsx    # Thanh toán & Áp dụng Voucher
│   │   └── admin/          # Khu vực quản trị (Thêm/Xóa sản phẩm, voucher)
│   └── _layout.tsx         # Root Layout (Bọc Provider, Theme)
├── components/             # Các component tái sử dụng (ProductRow, Header,...)
├── hooks/                  # Custom Hooks gọi API (useProducts, useCheckVoucher,...)
├── store/                  # Zustand Stores (cartStore, authStore)
├── theme/                  # Cấu hình màu sắc (Light/Dark mode), kích thước
├── types/                  # Định nghĩa các Interface TypeScript
├── utils/                  # Các hàm tiện ích (calculateTotal,...)
├── api/                    # Cấu hình Axios
└── db.json                 # Cơ sở dữ liệu giả lập cho JSON Server

⚙️ 3. Hướng Dẫn Cài Đặt & Chạy Dự Án
Bước 1: Cài đặt thư viện
Mở terminal tại thư mục gốc của dự án và chạy:

bash
npm install
Bước 2: Chạy Mock API (Backend giả lập)
Mở Terminal 1 và chạy lệnh sau để khởi động JSON Server (cổng 3000):

bash
npx json-server --watch db.json --port 3000
(Lưu ý: Nếu không chạy lệnh này, app vẫn hoạt động nhờ cơ chế fallback dữ liệu mẫu, nhưng sẽ không lưu được đơn hàng mới).

Bước 3: Chạy ứng dụng (Frontend)
Mở Terminal 2 và chạy:

bash
npx expo start
Nhấn w để mở trên trình duyệt Web.

Nhấn a để mở trên Android Emulator.

Quét mã QR bằng app Expo Go để chạy trên điện thoại thật.

🔑 4. Tài Khoản & Dữ Liệu Thử Nghiệm
Để test các chức năng, cả nhóm sử dụng các tài khoản sau:

Tài khoản Đăng nhập:

Khách hàng (User):

Username: user

Password: 123

Quản trị viên (Admin):

Username: admin

Password: 123

Mã giảm giá (Voucher) có sẵn trong hệ thống:

GIAM10: Giảm 10%

GIAM20: Giảm 20%

FREESHIP: Giảm 30.000đ

VIP50: Giảm 50%

SALE30: Giảm 30%

🎯 5. Các Chức Năng Chính Đã Hoàn Thiện
☑ Xác thực: Đăng nhập, phân quyền User/Admin, bảo vệ route.
☑ Trang chủ: Hiển thị danh sách sản phẩm dạng lưới (Grid), tìm kiếm, lọc theo danh mục.
☑ Chi tiết sản phẩm: Xem thông tin, chọn số lượng, thêm vào giỏ hàng.
☑ Giỏ hàng: Cập nhật số lượng, xóa sản phẩm, tính tổng tiền tự động.
☑ Thanh toán: Nhập địa chỉ, áp dụng mã giảm giá, đặt hàng.
☑ Quản trị (Admin): Xem dashboard, thêm/xóa sản phẩm, thêm/xóa voucher.
☑ Giao diện: Hỗ trợ Dark Mode / Light Mode, responsive trên Web và Mobile.
🤝 6. Quy Tắc Làm Việc Nhóm (Dành cho thành viên)
Không sửa code trực tiếp trên nhánh main: Mỗi người tạo một nhánh riêng (VD: feature/ten-ban), code xong thì tạo Pull Request để review.

Kiểm tra TypeScript trước khi Push: Chạy lệnh npx tsc --noEmit. Nếu có lỗi đỏ, phải sửa hết mới được push.

Đặt tên biến rõ ràng: Không viết tắt vô tội vạ. Sử dụng tiếng Anh chuẩn (VD: productList, không viết dsSp).

Comment code: Những đoạn logic phức tạp (như tính tiền, áp voucher) cần có comment giải thích.

Chúc cả nhóm hoàn thành xuất sắc bài thi cuối kỳ! 🚀

text

---

### 💡 Hướng dẫn sử dụng:
1. Tạo file `README.md` ở thư mục gốc (ngang hàng với `package.json`).
2. Copy toàn bộ nội dung trên dán vào.
3. Gửi link repo GitHub cho các thành viên, họ chỉ cần đọc file này là hiểu ngay cách chạy và cấu trúc dự án. 
4. Nếu bạn dùng Antigravity, hãy yêu cầu nó: *"Tạo file README.md với nội dung sau: [dán đoạn trên vào]"* là xong!