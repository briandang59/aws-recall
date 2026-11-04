import http from 'node:http';
import {readFile,writeFile} from 'node:fs/promises';
import {authorizationRequest,matchesState,setEnvValue,SHEETS_SCOPE} from '../lib/oauth.mjs';

const clientId = process.env.GOOGLE_CLIENT_ID, clientSecret = process.env.GOOGLE_CLIENT_SECRET;
if (!clientId || !clientSecret) {
  console.error('Điền GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET vào .env.local trước.');
  process.exit(1);
}
const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';
const redirect = new URL(redirectUri);
if (redirect.protocol !== 'http:' || !['localhost','127.0.0.1'].includes(redirect.hostname) || redirect.search || redirect.hash || redirect.username || redirect.password) {
  console.error('Công cụ cấp quyền cục bộ yêu cầu redirect URI http://localhost:PORT/path hoặc http://127.0.0.1:PORT/path.');
  process.exit(1);
}
const auth = authorizationRequest({clientId,redirectUri});
let used = false;
const server = http.createServer(async (req,res) => {
  res.setHeader('Content-Type','text/plain; charset=utf-8');
  res.setHeader('Cache-Control','no-store');
  res.setHeader('Referrer-Policy','no-referrer');
  res.setHeader('X-Content-Type-Options','nosniff');
  const url = new URL(req.url,redirect.origin);
  if (req.method !== 'GET' || url.pathname !== redirect.pathname) { res.writeHead(404); return res.end('Not found'); }
  if (used || !matchesState(auth.state,url.searchParams.get('state'))) { res.writeHead(400); return res.end('Phiên cấp quyền không hợp lệ.'); }
  if (url.searchParams.has('error')) {
    used = true; res.end('Bạn đã hủy cấp quyền. Có thể đóng tab này.');
    console.error('Google chưa được cấp quyền. Chạy lại khi sẵn sàng.'); server.close(); clearTimeout(timeout); return;
  }
  const code = url.searchParams.get('code');
  if (!code) { res.writeHead(400); return res.end('Thiếu mã cấp quyền.'); }
  used = true;
  try {
    const response = await fetch('https://oauth2.googleapis.com/token',{method:'POST',body:new URLSearchParams({client_id:clientId,client_secret:clientSecret,redirect_uri:redirectUri,grant_type:'authorization_code',code,code_verifier:auth.verifier}),signal:AbortSignal.timeout(20000)});
    const token = await response.json();
    if (!response.ok || !token.refresh_token) throw new Error('Google chưa trả refresh token. Kiểm tra OAuth consent và thử lại.');
    if (!String(token.scope || '').split(' ').includes(SHEETS_SCOPE)) throw new Error('Bạn chưa cấp quyền Google Sheets.');
    const file = new URL('../.env.local',import.meta.url);
    const text = await readFile(file,'utf8').catch(error => { if (error.code === 'ENOENT') return ''; throw error; });
    await writeFile(file,setEnvValue(text,'GOOGLE_REFRESH_TOKEN',token.refresh_token),{mode:0o600});
    res.end('Kết nối Google thành công. Bạn có thể đóng tab này và quay lại ứng dụng.');
    console.log('Đã lưu GOOGLE_REFRESH_TOKEN vào .env.local (giá trị được giữ kín).');
    console.log('Điền GOOGLE_SHEET_ID, APP_PASSWORD và SESSION_SECRET, rồi khởi động lại app. Khi deploy, thêm các biến này vào Vercel.');
  } catch (error) {
    res.writeHead(502); res.end('Chưa hoàn tất kết nối. Xem thông báo trong terminal và thử lại.');
    console.error(error.message);
  } finally { clearTimeout(timeout); server.close(); }
});
const timeout = setTimeout(() => { console.error('Hết thời gian cấp quyền (10 phút). Chạy lại để tiếp tục.'); server.close(); },10 * 60000);
server.on('error',error => {
  clearTimeout(timeout);
  console.error(`Không mở được cổng callback (${error.code}). Dừng ứng dụng đang dùng cổng ${redirect.port || 80}, hoặc đổi GOOGLE_OAUTH_REDIRECT_URI và thêm đúng URI đó trong Google Cloud Console.`);
  process.exitCode = 1;
});
server.listen(Number(redirect.port || 80),'127.0.0.1',() => {
  console.log('Mở đường dẫn sau trên trình duyệt để đăng nhập Google và cấp quyền Sheets:');
  console.log(auth.url);
  console.log('\nĐang chờ callback… Token sẽ được ghi vào .env.local, không in ra màn hình.');
});
