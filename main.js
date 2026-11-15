'use strict';

const { app, BrowserWindow, dialog } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const { ensureVendor, ensureJava, ensureBackend, stopBackend } = require('./bootstrap');

app.setName('REV Hardware Client 2 Legacy Mac');
const support = path.join(app.getPath('appData'), 'REV Hardware Client 2 Legacy Mac');
let window;
let readyPort = 0;
let quitting = false;
const logoPath = fs.existsSync(path.join(__dirname, 'rev.png'))
  ? path.join(__dirname, 'rev.png')
  : path.join(__dirname, 'assets', 'rev.png');
const logo = fs.readFileSync(logoPath).toString('base64');

function status(message) {
  if (!window) return;
  const safeMessage = message.replace(/[&<>"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[character]);
  const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>
    :root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#141d28;color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,sans-serif;text-align:center}
    main{width:min(100%,600px);padding:48px 32px}img{width:128px;height:128px;filter:drop-shadow(0 12px 24px #0005)}h1{font-size:30px;line-height:1.2;margin:25px 0 0;letter-spacing:-.02em}
    .spinner{width:42px;height:42px;border:4px solid #415062;border-top-color:#ff791c;border-radius:50%;margin:38px auto 26px;animation:spin .9s linear infinite}p{font-size:18px;line-height:1.45;margin:0;min-height:27px}small{display:block;color:#aeb9c6;font-size:14px;margin-top:17px}footer{color:#8391a1;font-size:12px;margin-top:54px}
    @keyframes spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.spinner{animation:none}}
  </style><main><img src="data:image/png;base64,${logo}" alt="REV Hardware Client 2"><h1>REV Hardware Client 2</h1><div class="spinner" role="progressbar" aria-label="Loading"></div><p role="status" aria-live="polite">${safeMessage}</p><small>First launch may take a few minutes.</small><footer>Unofficial legacy macOS launcher</footer></main></html>`;
  window.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`).catch(() => {});
}

function createWindow() {
  window = new BrowserWindow({
    title: 'REV Hardware Client 2 Legacy Mac',
    width: 1200, height: 850, minWidth: 850, minHeight: 600,
    backgroundColor: '#17202a',
    webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true }
  });
  window.on('closed', () => { window = null; });
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  status('Preparing the app…');
}

async function start() {
  if (!window) createWindow();
  if (!readyPort) {
    const vendorApp = await ensureVendor(support, status);
    const java = await ensureJava(support, status);
    if (quitting) return;
    readyPort = await ensureBackend(support, vendorApp, java, status);
  }
  if (quitting) { stopBackend(); return; }
  await window.loadURL(`http://127.0.0.1:${readyPort}/static/`);
}

if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('before-quit', () => { quitting = true; stopBackend(); });
  app.on('second-instance', () => window?.focus());
  app.whenReady().then(() => start().catch(error => {
    dialog.showErrorBox('REV Hardware Client 2 could not start', String(error.message || error));
    app.quit();
  }));
  app.on('activate', () => {
    if (!BrowserWindow.getAllWindows().length) start().catch(error => dialog.showErrorBox('REV Hardware Client 2 could not start', String(error.message || error)));
  });
  app.on('window-all-closed', () => app.quit());
}
