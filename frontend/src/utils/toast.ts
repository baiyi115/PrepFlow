let injected = false;

function isDark() {
  return document.documentElement.getAttribute('data-theme') === 'dark';
}

function show(msg: string, lightBg: string, lightFg: string, darkBg: string, darkFg: string, icon: string) {
  if (!injected) {
    const s = document.createElement('style');
    s.textContent = '@keyframes __ti{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}';
    document.head.appendChild(s);
    injected = true;
  }
  const bg = isDark() ? darkBg : lightBg;
  const fg = isDark() ? darkFg : lightFg;
  let c = document.getElementById('__tc');
  if (!c) {
    c = document.createElement('div');
    c.id = '__tc';
    c.style.cssText = 'position:fixed;top:16px;right:16px;z-index:99999;display:flex;flex-direction:column;gap:8px;max-width:380px;font-family:system-ui,sans-serif;font-size:14px;';
    document.body.appendChild(c);
  }
  const el = document.createElement('div');
  el.style.cssText = `display:flex;align-items:center;gap:8px;padding:11px 16px;border-radius:10px;background:${bg};color:${fg};animation:__ti .25s ease;box-shadow:0 4px 16px rgba(0,0,0,.3);line-height:1.4;`;
  const ispan = document.createElement('span');
  ispan.style.cssText = 'font-size:17px;font-weight:700;flex-shrink:0;';
  ispan.textContent = icon;
  el.appendChild(ispan);
  const mspan = document.createElement('span');
  mspan.textContent = msg;
  el.appendChild(mspan);
  c.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity .25s ease,transform .25s ease';
    el.style.opacity = '0';
    el.style.transform = 'translateX(20px)';
    setTimeout(() => { el.remove(); if (!c!.children.length) c!.remove(); }, 250);
  }, 3000);
}

export const toast = {
  success: (msg: string) => show(msg, '#f0fdf4', '#166534', '#1a2e05', '#65a30d', '✓'),
  error: (msg: string) => show(msg, '#fef2f2', '#991b1b', '#450a0a', '#ef4444', '✕'),
  warning: (msg: string) => show(msg, '#fffbeb', '#92400e', '#451a03', '#f59e0b', '⚠'),
  info: (msg: string) => show(msg, '#eff6ff', '#1e40af', '#172554', '#60a5fa', 'ℹ'),
};
