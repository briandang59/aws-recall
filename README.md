# AWS Recall

Phiên **Luyện tập tự do** tự động xáo trộn toàn bộ thẻ phù hợp trước khi chọn số thẻ mỗi phiên. Các chế độ đến hạn và điểm yếu vẫn giữ thứ tự ưu tiên.

Phiên đang học tự lưu trên trình duyệt, gồm thứ tự thẻ, vị trí hiện tại và trạng thái lật. Mở lại ứng dụng trên cùng trình duyệt sẽ tiếp tục phiên sau khi đăng nhập và tải dữ liệu. Phiên kết thúc hoặc hoàn thành sẽ được xóa khỏi bộ nhớ phiên; lịch sử ôn vẫn được giữ. Phiên này không đồng bộ giữa thiết bị và được lưu riêng cho bản thử và Google Sheets.

Không gian flashcard AWS cá nhân, giao diện tiếng Việt, nền xanh đen / sáng, nhấn cam ấm. Có animation lật thẻ, tìm kiếm, lọc dịch vụ, cảnh báo câu hỏi trùng, ghi chú, đánh dấu yêu thích, ôn theo lịch và sao lưu JSON.

Ứng dụng dùng HTML/CSS/JavaScript và API Node.js 22, không cần cài thư viện để chạy. Docker là cách triển khai mặc định trên Vercel theo yêu cầu.

## Cách dùng đề xuất: Vercel + OAuth trực tiếp

**Không cần cấp quyền hoặc cấu hình callback localhost nếu bạn chỉ dùng trên Vercel.**

1. Import mã nguồn lên Vercel, framework **Container**. Thêm `PORT=8080`, `GOOGLE_SHEET_ID`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `APP_PASSWORD`, `SESSION_SECRET` vào Environment Variables, rồi deploy để lấy tên miền.
2. Trong Google Cloud, bật **Google Sheets API** và cấu hình OAuth consent screen (thêm tài khoản của bạn vào Test users nếu đang Testing). Vào OAuth Client → Authorized redirect URIs, thêm:

   ```text
   https://TEN-WEB-CUA-BAN.vercel.app/api/auth/google/callback
   ```

3. Thêm `GOOGLE_OAUTH_REDIRECT_URI` trên Vercel bằng **chính xác URL đó**, rồi redeploy. Giữ redirect cũ nếu ứng dụng khác đang dùng.
4. Mở đúng tên miền đã khai báo, đăng nhập bằng `APP_PASSWORD`, bấm **Kết nối Google Sheets** và cấp quyền bằng tài khoản có quyền sửa Sheet. App tự quay lại và mở thư viện.

**Không cần `GOOGLE_REFRESH_TOKEN` trong Environment Variables cho cách này.** Refresh token được mã hóa AES-256-GCM trong cookie HttpOnly / Secure, JavaScript phía giao diện không đọc được. Khóa mã hóa lấy từ `SESSION_SECRET` ổn định của bạn. Mỗi trình duyệt cần kết nối Google riêng; đăng xuất sẽ xóa cookie kết nối, dữ liệu Sheet vẫn được giữ nguyên. Nếu đổi `SESSION_SECRET` hoặc Google thu hồi quyền, kết nối lại Google.

Sheet ID của bạn đã được điền trong `.env.local` trên máy hiện tại. Client ID / Client Secret, mật khẩu ban đầu và session secret cũng nằm trong file này để bạn đưa vào Vercel. `.env.local` được loại khỏi Git, Docker image và gói source Vercel; không chia sẻ hoặc commit file.

## Mở ngay trên Windows

Nhấp đúp `start.cmd`, sau đó mở **http://localhost:4174**. Giữ cửa sổ terminal mở.

Hoặc chạy trong thư mục dự án:

```powershell
$env:PORT = '4174'
npm run dev
```

Nếu không đặt `PORT`, `npm run dev` mặc định dùng cổng 3000. Bản thử tự tạo 12 thẻ mẫu và lưu dữ liệu trong localStorage của trình duyệt. Chế độ lưu trữ luôn được hiển thị ở sidebar và Cài đặt. Dữ liệu chưa được đồng bộ Google cho đến khi cấu hình và cấp quyền xong.

**Xuất JSON trước khi đổi trình duyệt, hostname, cổng, hoặc chuyển từ demo sang Google Sheets.** localStorage của `localhost:4174` khác `localhost:3000`. Trong chế độ Sheets, dữ liệu được lưu trực tiếp qua API sau mỗi thao tác thành công; không tự chuyển về demo khi lỗi kết nối.

## Tùy chọn: lấy refresh token trên máy cá nhân

Phần này chỉ dành cho người muốn dùng `GOOGLE_REFRESH_TOKEN` ở phía server cho nhiều thiết bị. **Có thể bỏ qua toàn bộ nếu kết nối trực tiếp trên Vercel theo hướng dẫn ở trên.**

File `client_secret_*.apps.googleusercontent.com.json` là thông tin OAuth web client, không phải Service Account và cũng không phải một API key đủ quyền đọc/ghi Sheet. Client ID / Client Secret đã được đưa vào `.env.local` trên máy hiện tại. File này được loại khỏi Git và Docker image.

1. Trong Google Cloud của OAuth client, bật **Google Sheets API**. Cấu hình OAuth consent screen; nếu ứng dụng đang Testing, thêm tài khoản Google của bạn vào Test users.
2. Tạo một Google Sheet trống bằng tài khoản sẽ cấp quyền. Lấy phần ID từ URL:

   ```text
   https://docs.google.com/spreadsheets/d/GOOGLE_SHEET_ID/edit
   ```

3. Kiểm tra `.env.local` có `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` và `GOOGLE_OAUTH_REDIRECT_URI`. Redirect trong file được cung cấp là:

   ```text
   http://localhost:3000/api/auth/google/callback
   ```

   Công cụ cấp quyền sẽ tạm mở một HTTP server tại cổng này. Trên máy hiện tại, cổng 3000 đang chạy ứng dụng khác nên `.env.local` đã được đổi sang `http://localhost:4175/api/auth/google/callback`. **Cần thêm chính xác URI 4175 này vào Authorized redirect URIs của OAuth client trên Google Cloud Console**, giữ URI cũ để không ảnh hưởng ứng dụng hiện có. URI phải khớp cả cổng và đường dẫn. Không đổi sang cổng của app đang chạy.

4. Chạy:

   ```sh
   npm run google:connect
   ```

   Mở đường dẫn terminal in ra, đăng nhập và cấp quyền Sheets. Công cụ dùng state ngẫu nhiên và PKCE, tự ghi `GOOGLE_REFRESH_TOKEN` vào `.env.local`; không in Client Secret hoặc token. Chờ thông báo thành công rồi đóng tab. OAuth helper chỉ dùng để thiết lập cục bộ, không được mở như một route cấp token công khai trên Vercel.

5. Điền `GOOGLE_SHEET_ID`, `APP_PASSWORD` (mật khẩu bạn dùng vào app), và `SESSION_SECRET` (chuỗi ngẫu nhiên tối thiểu 32 ký tự). Trên máy hiện tại, Sheet ID đã được điền, mật khẩu ban đầu và session secret đã được tạo trong `.env.local`; bạn có thể mở file để xem hoặc đổi mật khẩu. Không chia sẻ file này. Với bản cài đặt mới, có thể tạo session secret bằng lệnh sau:

   ```sh
   node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
   ```

6. Khởi động lại app. Đăng nhập bằng `APP_PASSWORD`. App tự tạo hai tab **Cards** và **Reviews** nếu chưa có. Sheet trống sẽ có nút thêm 12 thẻ mẫu. Nếu muốn chuyển dữ liệu demo, dùng **Cài đặt → Nhập JSON**.

Token Google được refresh ở phía server. Nếu quyền Google bị thu hồi hoặc hết hạn, chạy lại `npm run google:connect` rồi cập nhật token trên môi trường triển khai. Vercel không tự đọc file `.env.local` trên máy bạn.

Tài liệu chính thức: [Google OAuth cho web server](https://developers.google.com/identity/protocols/oauth2/web-server).

## Cách thay thế: Service Account

Nếu muốn dùng Service Account thay OAuth:

1. Tạo Service Account và JSON key trong Google Cloud; bật Google Sheets API.
2. Chia sẻ một Google Sheet trống cho email Service Account với quyền **Editor**.
3. Điền `GOOGLE_SHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `APP_PASSWORD`, `SESSION_SECRET` theo `.env.example`. Giữ private key trong dấu ngoặc kép và dùng `\n` cho xuống dòng.
4. Khởi động lại hoặc deploy lại. Không cần chạy `google:connect` ở cách này.

Nếu có đủ cả hai loại cấu hình, ứng dụng ưu tiên Service Account.

## Chạy bằng Docker

Cần Docker Desktop / Engine đang hoạt động và Docker Compose v2.24+.

```sh
docker compose up --build -d
```

Mở **http://localhost:3000**. Compose nạp `.env.local` nếu file tồn tại; nếu chưa có cấu hình Google hoàn chỉnh thì dùng demo. Cấu hình Google dở dang sẽ báo lỗi thiết lập thay vì ghi vào nơi khác.

```sh
docker compose logs -f
docker compose down
```

Chạy không dùng Compose:

```sh
docker build -t aws-recall .
docker run --rm -p 127.0.0.1:3000:8080 -e COOKIE_SECURE=false aws-recall
```

Muốn dùng Google trong lệnh `docker run`, truyền các biến bằng môi trường runtime. Với private key có `\n` hoặc giá trị có dấu ngoặc kép, ưu tiên Compose `env_file` để được xử lý đúng định dạng dotenv.

Dockerfile có giai đoạn chạy tests và kiểm tra cú pháp trước khi tạo image runtime. Image chạy bằng user `node`, không chứa `.env.local`, file OAuth gốc, tests hay thư viện npm. Compose bật filesystem chỉ đọc và bỏ Linux capabilities. Không cần volume; dữ liệu ở Google Sheets hoặc trình duyệt, tùy chế độ.

`COOKIE_SECURE=false` chỉ dành cho HTTP trên máy cá nhân. Khi tự host qua HTTPS, bỏ thiết lập đó. Trên Vercel, ứng dụng luôn dùng Secure cookie.

## Deploy Docker lên Vercel

Vercel hiện hỗ trợ Container Runtime ở trạng thái beta. Dự án có `Dockerfile` và `vercel.json` với `"framework": "container"`.

1. Đưa mã nguồn thư mục `aws-recall` lên một Git repository của bạn. **Không đưa `.env.local` hoặc file OAuth JSON lên Git.**
2. Import repository vào Vercel. Chọn Root Directory chứa `Dockerfile` (`aws-recall` nếu bạn đưa cả workspace vào repo; `.` nếu repo chỉ chứa ứng dụng).
3. Chọn framework **Container**, để Vercel build Dockerfile. Không đặt build/output override kiểu static website.
4. Trong **Settings → Environment Variables**, thêm:

   | Biến | Giá trị |
   | --- | --- |
   | `PORT` | `8080` — bắt buộc để Vercel gửi request đúng cổng container |
   | `GOOGLE_SHEET_ID` | ID Sheet của bạn |
   | `GOOGLE_CLIENT_ID` | OAuth Client ID |
   | `GOOGLE_CLIENT_SECRET` | OAuth Client Secret |
   | `GOOGLE_OAUTH_REDIRECT_URI` | `https://TEN-WEB.vercel.app/api/auth/google/callback`, cũng cần thêm vào Google Cloud |
   | `GOOGLE_REFRESH_TOKEN` | Không bắt buộc — bỏ trống khi kết nối ngay trên web |
   | `APP_PASSWORD` | Mật khẩu riêng của bạn |
   | `SESSION_SECRET` | Chuỗi ngẫu nhiên, ít nhất 32 ký tự |

   Với Service Account, thay thông tin OAuth bằng `GOOGLE_SERVICE_ACCOUNT_EMAIL` và `GOOGLE_PRIVATE_KEY`. Nếu dùng refresh token được lấy cục bộ, không cần redirect URI ở runtime; nếu kết nối trực tiếp trên web thì cần URI theo tên miền triển khai.

5. Deploy. Nếu chưa biết tên miền ở lần đầu, lấy URL sau deploy, thêm callback vào Google Cloud và `GOOGLE_OAUTH_REDIRECT_URI` trên Vercel, rồi redeploy. Mở app, đăng nhập và bấm **Kết nối Google Sheets** để cấp quyền. Khi hoàn tất, sidebar báo **Đã kết nối Google Sheets**. Khi thay biến môi trường, redeploy để áp dụng.

Hoặc dùng Vercel CLI trong thư mục dự án sau khi đăng nhập CLI và cấu hình các biến trên:

```sh
npx vercel
npx vercel --prod
```

Docker Compose phục vụ chạy cục bộ; Vercel build từ Dockerfile. Không cần đẩy image thủ công. Xem [Container Runtime](https://vercel.com/docs/functions/runtimes/container) và [hướng dẫn Docker của Vercel](https://vercel.com/kb/guide/docker).

## Các luồng đã có

### Dịch vụ và nhãn cho SAA-C03

Danh mục có **125 dịch vụ/chủ đề trong 17 nhóm**, gồm các dịch vụ trong [phạm vi SAA-C03 của AWS](https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03/saa-03-in-scope-services.html), cùng một nhóm thành phần/kiến trúc bổ sung. Cách chia nhóm phục vụ tìm kiếm, không thể hiện trọng số kỳ thi. Đối chiếu danh sách ngày 2026-11-04; phạm vi AWS có thể thay đổi.

Trong form thêm/sửa, bấm dịch vụ rồi tìm bằng tên, tên viết tắt hoặc nhóm tiếng Việt: `ALB` → ELB, `DNS` → Route 53, `SSM` → Systems Manager, `lưu trữ` → nhóm Storage. Có thể dùng phím mũi tên để duyệt và Enter để chọn. Bộ lọc thư viện và phần ôn tập dùng cùng danh sách, chia theo nhóm.

Có **37 nhãn chọn nhanh**: SAA-C03, bốn miền kiến thức, chủ đề kỹ thuật và cách ôn tập. Thẻ mới mặc định có `SAA-C03`; nhãn của thẻ cũ được giữ khi mở sửa. Nhãn gợi ý thay đổi theo dịch vụ, không tự ghi đè nhãn bạn đã chọn. Bạn vẫn có thể nhập nhãn riêng, tối đa 8 nhãn/thẻ. Các nhãn có sẵn dùng ID ổn định như `secure-architectures`, `resilient-architectures`, `high-performance`, `cost-optimization` để lưu Sheets; giao diện nút chọn hiển thị mô tả tiếng Việt.

Khi cập nhật trên GitHub, push toàn bộ thay đổi trong **public/** (bao gồm `shared/catalog.js` và `editor-fields.js`) rồi redeploy; API dùng chung danh mục để kiểm tra dịch vụ, nên cần redeploy cả ứng dụng. Không cần sửa cấu trúc Google Sheet.

- **Tổng quan:** số thẻ, số đến hạn, thẻ đã nhớ, chuỗi ngày học, hoạt động 7 ngày, chủ đề và thẻ gần đây. Dữ liệu thống kê tính từ lượt học thực tế, không tạo lịch sử giả.
- **Thư viện:** tìm cả câu hỏi, đáp án, dịch vụ, nhãn và ghi chú; lọc theo dịch vụ / đến hạn / yêu thích; dạng lưới hoặc danh sách; thêm, sửa và xóa thẻ.
- **Kiểm tra trùng:** bỏ khác biệt hoa thường, dấu câu, khoảng trắng; nhận diện SG / Security Group và NACL / Network ACL; cảnh báo tương tự theo từ khóa. Không dùng AI, không bảo đảm nhận diện mọi cách diễn đạt cùng một ý. Kiểm tra câu hỏi trùng chính xác lại phía server khi lưu.
- **Ôn tập:** đến hạn, điểm yếu, yêu thích, chủ đề hoặc tự do. Lật bằng Space, đánh giá bằng 1–4. Chưa nhớ → 10 phút; Khó → tối thiểu 1 ngày; Nhớ → khoảng cách tăng dần; Rất dễ → tối thiểu 4 ngày. Đây là lịch ôn đơn giản, không phải FSRS/Anki.
- **Ghi chú:** sửa ngay khi học và xem tổng hợp trong tab Ghi chú.
- **Sao lưu:** JSON có nội dung, ghi chú, tiến độ và lịch sử. Nhập bỏ qua thẻ trùng ID/câu hỏi. Nhập vào demo giữ tiến độ của thẻ mới; nhập vào Sheets thêm nội dung thẻ mới và bắt đầu lịch ôn mới, không ghi đè tiến độ đang có trên Sheets.

## Cấu trúc Google Sheet

App tự tạo tiêu đề. Không đổi thứ tự cột, không xóa tiêu đề hay đặt dữ liệu khác vào hai tab này. Có thể thêm tab riêng cho mục đích khác.

`Cards`, A–O:

```text
id | question | answer | explanation | service | tags | note | source | favorite | createdAt | updatedAt | dueAt | lastReviewedAt | interval | repetitions
```

`tags` là mảng JSON, `favorite` là boolean, `interval` là số ngày và các trường ngày dùng ISO 8601. `note` và tiến độ được giữ cùng hàng với thẻ để giảm số request và tránh tách dữ liệu liên quan.

`Reviews`, A–D:

```text
id | cardId | rating | at
```

Mỗi lượt ôn cập nhật thẻ và thêm lịch sử trong cùng một Google Sheets batch request. Retry cùng review ID không tăng tiến độ hai lần. Xóa thẻ giữ lại lịch sử học để thống kê không bị mất. Xóa bằng cách xóa nội dung hàng, giữ vị trí các hàng khác.

## Kiểm tra và giới hạn

### Nếu OAuth trả 404 trên Vercel

Vercel Functions ánh xạ URL theo cấu trúc file. Mã nguồn có sẵn hai entry point dùng chung OAuth handler với Docker:

```text
api/auth/google.mjs           → /api/auth/google
api/auth/google/callback.mjs  → /api/auth/google/callback
```

Đảm bảo cả hai file đã được push lên Git và redeploy. Nếu `/api/session` trả 200 nhưng `/api/auth/google` trả `NOT_FOUND` từ Vercel, kiểm tra hai entry point này và Root Directory. Route bắt đầu phải trả 401 khi chưa đăng nhập hoặc 302 đến Google khi đã đăng nhập; mở callback trực tiếp thiếu state sẽ trả 400. Callback chỉ được gọi từ luồng cấp quyền Google, không dùng làm trang bắt đầu đăng nhập.

Với Container preset, `server.mjs` xử lý cả hai route. Với native Node.js Functions, hai file trên xử lý URL tương ứng. Không dùng rewrite tất cả request về `index.html`, vì như vậy API sẽ trả HTML thay vì JSON/redirect.

### Nếu báo tên miền không khớp GOOGLE_OAUTH_REDIRECT_URI

Trong Vercel → Settings → Environment Variables, đặt `GOOGLE_OAUTH_REDIRECT_URI` theo đúng domain đang mở, ví dụ `https://aws-recall-three.vercel.app/api/auth/google/callback`, cho môi trường Production. Không dùng giá trị localhost hoặc URL của một Preview deployment khác. Google Cloud → OAuth Client → Authorized redirect URIs cũng cần URL đó. Redeploy sau khi thay đổi biến môi trường.

OAuth handler đọc `x-forwarded-host` khi chạy trên Vercel và chuẩn hóa chữ hoa / port mặc định. Nếu vẫn khác tên miền, lỗi trả về `details.requestHost`, `details.configuredRedirectUri` và `details.expectedRedirectUri` để bạn biết cần sửa giá trị nào; các trường này không chứa secret/token.

```sh
npm test
npm run build
docker compose config --quiet
```

Tests gồm validation, phát hiện trùng, lịch ôn, session HMAC, chống request khác origin, OAuth state/PKCE, callback web, cookie mã hóa, cách ly token giữa request đồng thời, lưu token cục bộ, chuyển đổi hàng Sheets và CRUD/review qua Google API giả lập. `npm run build` kiểm tra cú pháp ES modules và sự hiện diện các file triển khai; ứng dụng static không cần bundler.

Kiểm tra trên môi trường xây dựng hiện tại: 23 tests và kiểm tra cú pháp đạt, bao gồm danh mục SAA-C03, tìm kiếm alias/tiếng Việt, nhãn có sẵn, tương thích thẻ cũ và vòng lưu/đọc Sheets, entry point OAuth, proxy host và chẩn đoán callback sai tên miền; trang chủ và `/api/session` trả HTTP 200; Compose hợp lệ. **Chưa chạy được kiểm tra bằng trình duyệt thực và Docker build/run do quyền hệ thống hạn chế. Các thay đổi hiện ở mã nguồn cục bộ; cần push GitHub và redeploy để áp dụng lên website.**

Ứng dụng dành cho **một người dùng cá nhân**. Có kiểm tra `updatedAt` trước khi ghi nhưng Google Sheets không cung cấp compare-and-swap cho mô hình này; không bảo đảm chống mọi tranh chấp khi nhiều tab/người ghi đồng thời. Hạn chế sửa trực tiếp/sắp xếp Sheets khi app đang ghi. Login có giới hạn thử mật khẩu trong bộ nhớ mỗi instance; nếu đưa lên Internet, có thể thêm rate limit ở Vercel Firewall.

Google Sheets có [hạn mức API](https://developers.google.com/workspace/sheets/api/limits); app đọc theo batch và cache access token. Demo hỗ trợ file nhập tối đa 1 MB, 3.000 thẻ và 100.000 lượt ôn (còn phụ thuộc dung lượng localStorage); Sheets nhập tối đa 300 thẻ mới mỗi lần. Với nhiều người dùng hoặc khối lượng lớn, nên chuyển dữ liệu sang database.
