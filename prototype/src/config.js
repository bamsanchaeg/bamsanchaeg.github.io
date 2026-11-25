/* ===== Supabase 연결 설정 =====
   Supabase 대시보드 › Project Settings › API 에서 복사해 넣는다.
   key 에는 공개용(anon / publishable) 키만 넣을 것. service_role·secret 키는 절대 넣지 않는다(앱이 거부한다). */
const CONFIG = {
  url: "https://cncshhbsfkugqwgvkgwk.supabase.co",
  key: "sb_publishable_lvZvfqBR6vIWuEI2Tb3NHw_2nhGguFC",
  google: false,
  captcha: '', // Cloudflare Turnstile '사이트 키'(공개값). 비워 두면 쓰지 않는다. 비밀 키는 Supabase 대시보드에만 넣는다.
};
