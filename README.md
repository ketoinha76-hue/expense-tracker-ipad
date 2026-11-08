# Ứng Dụng Quản Lý Thu Chi Cá Nhân (iPad & iOS)

Ứng dụng quản lý thu chi cá nhân chuyên nghiệp, tối ưu giao diện cho màn hình lớn của **iPad** (hỗ trợ đầy đủ iPadOS dưới 18.0 như iOS 15, 16, 17 và 18+).

---

## 1. Cách chạy thử ứng dụng ngay trên iPad (Không cần cáp, quét mã QR)

1. Trên iPad, vào **App Store** và tải ứng dụng miễn phí: **Expo Go**.
2. Đảm bảo máy tính Windows và iPad cùng kết nối chung một mạng Wi-Fi.
3. Trên máy tính Windows, mở terminal tại thư mục này và gõ:
   ```bash
   npx expo start
   ```
4. Terminal sẽ hiển thị một **mã QR**.
5. Mở ứng dụng **Camera** hoặc app **Expo Go** trên iPad > Quét mã QR.
6. Ứng dụng sẽ được tải và chạy trực tiếp, hiển thị đầy đủ giao diện iPad native.

---

## 2. Cách xuất file `.ipa` trực tiếp từ Windows (Dùng Expo Cloud)

Bạn có thể xuất file `.ipa` mà **không cần máy Mac** bằng dịch vụ đám mây miễn phí của Expo:

1. Đăng ký một tài khoản miễn phí tại [expo.dev](https://expo.dev).
2. Trong terminal dự án, đăng nhập tài khoản Expo:
   ```bash
   npx eas login
   ```
3. Chạy lệnh xuất file `.ipa`:
   ```bash
   npx eas build --platform ios --profile preview
   ```
4. Server macOS của Expo sẽ tự động biên dịch và tạo một đường link để bạn tải file `.ipa` về máy tính.

---

## 3. Cách cài file `.ipa` vào iPad từ Windows

1. Tải và cài đặt phần mềm **[Sideloadly](https://sideloadly.io/)** trên máy tính Windows.
2. Cắm iPad vào máy tính bằng cáp sạc.
3. Kéo thả file `.ipa` đã tải từ bước 2 vào ô của Sideloadly.
4. Nhập Apple ID cá nhân của bạn và bấm **Start**.
5. Sau khi cài xong, trên iPad vào:
   `Cài đặt (Settings)` > `Cài đặt chung (General)` > `Quản lý VPN & Thiết bị` > Bấm **Tin cậy (Trust)** Apple ID của bạn để mở ứng dụng.
