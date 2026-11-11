const preferenceKey = 'aws-atlas-theme';
const media = matchMedia('(prefers-color-scheme: dark)');
let preference = 'system';
try { const value=localStorage.getItem(preferenceKey); if(['light','dark','system'].includes(value)) preference=value; } catch { /* Keep the system preference when storage is blocked. */ }
function applyTheme(){
 const dark=preference==='dark'||(preference==='system'&&media.matches);
 document.documentElement.dataset.theme=dark?'dark':'light';
 document.documentElement.style.colorScheme=dark?'dark':'light';
 document.querySelector('meta[name="theme-color"]')?.setAttribute('content',dark?'#121620':'#f6f7fb');
 const button=document.getElementById('theme-toggle');
 if(button){button.textContent=dark?'☀':'☾';button.setAttribute('aria-label',dark?'Chuyển sang giao diện sáng':'Chuyển sang giao diện tối');button.setAttribute('aria-pressed',String(dark));button.title=dark?'Light mode':'Dark mode';}
}
applyTheme();
media.addEventListener('change',()=>{if(preference==='system')applyTheme();});
document.addEventListener('DOMContentLoaded',()=>{
 applyTheme();
 document.getElementById('theme-toggle')?.addEventListener('click',()=>{
  preference=document.documentElement.dataset.theme==='dark'?'light':'dark';
  try{localStorage.setItem(preferenceKey,preference);}catch{ /* Theme still works for this page session. */ }
  applyTheme();
 });
});
