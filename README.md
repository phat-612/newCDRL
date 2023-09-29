**Tên dự án**: Hệ thống Đánh giá Điểm rèn luyện Sinh viên trường ĐH Kỹ Thuật Công Nghệ Cần Thơ (CTUET)

**Tác giả**: 
- Nguyễn Lê Tấn Đạt (aka Nguyễn Lê Tấn Đạt)
- Nguyễn Văn Phát (aka Nguyễn Phát)
- Nguyễn Hưng Thịnh (aka HT-Kill_All)
- Nguyễn Ngọc Long (aka Long Đại Đế)
- Nguyễn Trần Hoàng Long (aka nthl đang)
- Nguyễn Bình Minh (aka Saitama mạnh nhất vũ trụ)

## Mô tả dự án
Hệ thống Đánh giá Điểm rèn luyện Sinh viên CTUET là một ứng dụng web dành riêng cho cộng đồng Sinh viên, Ban cán sự lớp và Đoàn khoa tại Trường Đại học Kỹ Thuật Công Nghệ Cần Thơ. Dự án này cung cấp nền tảng để quản lý và đánh giá điểm rèn luyện của sinh viên dựa trên các chức năng cụ thể của từng đối tượng.

## Chức năng
### Sinh viên:
- Đăng nhập và quản lý tài khoản cá nhân.
- Đánh giá điểm rèn luyện của bản thân.
- Xem điểm rèn luyện cá nhân.

### Ban cán sự lớp:
- Đăng nhập và quản lý tài khoản ban cán sự lớp.
- Thực hiện các chức năng tương tự như Sinh viên.
- Đánh giá điểm mức tập thể cho lớp.
- Quản lý hoạt động của lớp.

### Đoàn khoa:
- Đăng nhập và quản lý tài khoản Đoàn khoa.
- Thực hiện các chức năng tương tự như Ban cán sự lớp.
- Quản lý bộ môn, lớp học, cố vấn và sinh viên trong hệ thống.
- Đánh giá điểm mức Đoàn khoa cho lớp học được chọn.
- Quản lý hoạt động của Đoàn khoa.
- Quản lý thời gian mở/đóng chấm điểm rèn luyện.

## Cài đặt và triển khai
1. Clone dự án từ repository.
2. Cài đặt các dependencies bằng cách chạy lệnh `npm install`.
3. Cấu hình cơ sở dữ liệu theo tài liệu hướng dẫn.
4. Chạy ứng dụng bằng lệnh `node .\backend\server.js`.
5. Truy cập ứng dụng qua địa chỉ `http://localhost`.

## Cấu trúc dự án
- **.certificate/**: Thư mục chứa các chứng chỉ hoặc tệp liên quan đến chứng chỉ cho dự án.
- **.credentials/**: Thư mục dành cho các tệp liên quan đến thông tin xác thực, ví dụ như tài khoản, mật khẩu, khóa truy cập, v.v.
- **.downloads/**: Thư mục chứa các tệp tải về từ dự án.
- **TL Tham Khao/**: Thư mục chứa tài liệu tham khảo hoặc tài liệu liên quan đến dự án.
- **backend/**: Thư mục chứa mã nguồn và tệp cấu hình liên quan đến phần backend của dự án.
- **src/**: Thư mục gốc cho mã nguồn chính của ứng dụng.
  - **JS/**: Thư mục chứa các tệp mã nguồn JavaScript của dự án.
  - **css/**: Thư mục chứa các tệp CSS cho giao diện của dự án.
  - **emailTemplate/**: Thư mục chứa các tệp mẫu email hoặc liên quan đến email.
  - **excelTemplate/**: Thư mục chứa các tệp mẫu Excel hoặc liên quan đến Excel.
  - **img/**: Thư mục chứa các tệp hình ảnh, biểu đồ, hình minh họa cho dự án.
- **views/**: Thư mục chứa các tệp mã nguồn liên quan đến phần giao diện và hiển thị của ứng dụng.

## Đóng góp
Nếu bạn muốn đóng góp vào dự án, vui lòng tạo pull request vào nhánh phù hợp. Hãy đảm bảo tuân thủ các hướng dẫn về mã hóa và kiến thức.

## Giấy phép
Dự án được phát hành dưới Giấy phép MIT. Xem tệp [LICENSE](LICENSE) để biết thêm chi tiết.

## Liên hệ
Nếu bạn có bất kỳ câu hỏi hoặc góp ý nào, vui lòng liên hệ với chúng tôi qua email: [chuasuynghira.email@chuasuynghira.com](mailto:chuasuynghira.email@chuasuynghira.com).

