# 🛍️ LumiShop - Ứng Dụng Bán Hàng Online (Cross-Platform)

Chào mừng các thành viên nhóm đến với dự án **LumiShop**! Đây là ứng dụng bán hàng online được xây dựng bằng **Expo (React Native)**, có khả năng chạy mượt mà trên cả **Mobile (iOS/Android)** và **Web (Trình duyệt)**. 

Dự án này được thực hiện cho bài thi cuối kỳ môn **Lập trình Mobile**, kết hợp ý tưởng nghiệp vụ từ môn **Phân tích thiết kế hệ thống**. Toàn bộ hệ thống được tổ chức theo **Kiến trúc 4 tầng** chuẩn mực.

---

## 🚀 1. Công Nghệ Sử Dụng (Tech Stack)

- **Framework:** Expo (React Native) + TypeScript.
- **Routing:** Expo Router (File-based routing).
- **Quản lý dữ liệu (Data Fetching):** TanStack Query (React Query v5).
- **Gọi HTTP:** Axios (được gói gọn trong tầng API).
- **Lưu trữ cục bộ:** AsyncStorage / SecureStore (Mobile) & localStorage (Web).
- **Giao diện (UI):** React Native StyleSheet tùy chỉnh (Modern UI, bo góc, gradient).
- **Mock API:** Custom JSON Server (`server.cjs`) - Cho phép đọc/ghi trực tiếp vào các file JSON.

---

## 🏗️ 2. Kiến Trúc 4 Tầng (Cốt lõi)

Dự án tuân thủ nghiêm ngặt luồng đi của dữ liệu:
**Data (File JSON) → API Layer (Gọi HTTP) → TanStack Query (Cache) → Components (Giao diện)**

1. **Tầng 1 - Data:** Dữ liệu nằm trong thư mục `data/` (products.json, categories.json...). File `server.cjs` đảm nhận việc ghi (POST/PUT/DELETE) trực tiếp vào các file này.
2. **Tầng 2 - API (`api/`):** Chỉ chứa các hàm gọi Axios (VD: `productApi.getAll()`). Không chứa logic UI.
3. **Tầng 3 - TanStack Query (`hooks/`):** Chứa các hook như `useProducts()`, `useLogin()`. Quản lý cache, trạng thái loading/error và tự động gọi lại API khi cần (`invalidateQueries`).
4. **Tầng 4 - UI (`app/`, `components/`):** Chỉ hiển thị và gọi hooks. Tuyệt đối không gọi Axios trực tiếp.

---

## 📂 3. Cấu Trúc Thư Mục Dự Án

```text
LumiShop/
├── app/                    # Tầng 4: Màn hình (Expo Router)
│   ├── (auth)/             # Màn hình chưa đăng nhập
│   │   ├── _layout.tsx
│   │   └── sign-in.tsx     # Đăng nhập
│   ├── (app)/              # Màn hình đã đăng nhập (Được bảo vệ)
│   │   ├── _layout.tsx
│   │   ├── index.tsx       # Trang chủ (Danh sách sản phẩm)
│   │   ├── product/[id].tsx# Chi tiết sản phẩm
│   │   ├── cart.tsx        # Giỏ hàng
│   │   ├── checkout.tsx    # Thanh toán
│   │   └── admin/          # Quản trị (products, vouchers)
│   └── _layout.tsx         # Root Layout
├── api/                    # Tầng 2: Gọi HTTP (productApi, cartApi,...)
├── hooks/                  # Tầng 3: TanStack Query (useProductsQuery,...)
├── components/             # UI Components (ProductRow, Header,...)
├── store/                  # Zustand (chỉ dùng cho Auth/Session)
├── data/                   # Tầng 1: Database (products.json, carts.json...)
├── types/                  # Định nghĩa Interface TypeScript
├── theme/                  # Màu sắc, Style
├── utils/                  # Hàm tiện ích
├── server.cjs              # Server giả lập (đọc/ghi file JSON)
└── package.json
⚙️ 4. Hướng Dẫn Cài Đặt & Chạy Dự Án
Bước 1: Cài đặt thư viện

bash
npm install
Bước 2: Chạy Mock API (Terminal 1)

bash
npm run server
(Server sẽ chạy ở cổng 3000 và tự động ghi lại mọi thay đổi vào file JSON)

Bước 3: Chạy ứng dụng (Terminal 2)

bash
npx expo start
Nhấn w để mở trên trình duyệt Web.

Nhấn a để mở trên Android Emulator.

Quét mã QR bằng app Expo Go để chạy trên điện thoại.

🔑 5. Tài Khoản & Dữ Liệu Thử Nghiệm
Tài khoản Đăng nhập:

Khách hàng (User): Username: user | Password: 123

Quản trị viên (Admin): Username: admin | Password: 123

Mã giảm giá (Voucher) có sẵn:

GIAM10: Giảm 10%

GIAM20: Giảm 20%

FREESHIP: Giảm 30.000đ

VIP50: Giảm 50%

SALE30: Giảm 30% (Lưu ý: Mã này đã hết hạn, dùng để test chức năng báo lỗi)

🎯 6. Các Chức Năng Chính Đã Hoàn Thiện
☑ Xác thực: Đăng nhập, phân quyền, bảo vệ route (Protected Routes).
☑ Trang chủ: Hiển thị lưới sản phẩm, tìm kiếm, lọc theo danh mục, phân trang.
☑ Chi tiết sản phẩm: Xem thông tin, chọn số lượng, thêm vào giỏ.
☑ Giỏ hàng: Đồng bộ trực tiếp với Database (data/carts.json), cập nhật số lượng, tính tổng tiền.
☑ Thanh toán: Nhập địa chỉ, áp dụng mã giảm giá (có kiểm tra hạn sử dụng), đặt hàng.
☑ Quản trị (Admin): Dashboard, Thêm/Sửa/Xóa sản phẩm (có upload ảnh), Thêm/Sửa/Xóa voucher.
☑ Giao diện: Responsive, hỗ trợ Light/Dark Mode.
🤝 7. Quy Tắc Làm Việc Nhóm
Không sửa code trực tiếp trên nhánh main: Tạo nhánh riêng (VD: feature/ten-ban), code xong tạo Pull Request.

Kiểm tra TypeScript trước khi Push: Chạy npx tsc --noEmit. Sạch lỗi mới được push.

Tuân thủ kiến trúc 4 tầng: Không gọi Axios trực tiếp trong màn hình (phải thông qua hook).

Comment code: Các logic tính tiền, voucher, phân trang cần có comment giải thích rõ ràng.

Chúc cả nhóm hoàn thành xuất sắc bài thi cuối kỳ! 🚀

text

---

### 💡 Lưu ý:
- File này đã được cập nhật các lệnh chạy mới (`npm run server` thay vì `npx json-server`).
- Đã ghi rõ kiến trúc 4 tầng để khi giảng viên đọc vào là thấy ngay sự chuyên nghiệp.
- Đã cập nhật tài khoản test và các mã voucher (bao gồm cả mã `SALE30` đã hết hạn để test lỗi).

Bạn lưu lại file này và push lên GitHub cho cả nhóm cùng xem nhé!