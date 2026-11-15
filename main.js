'use strict';

const { app, BrowserWindow, dialog } = require('electron');
const path = require('node:path');
const { ensureVendor, ensureJava, ensureBackend } = require('./bootstrap');

app.setName('REV Hardware Client 2 Legacy Mac');
const support = path.join(app.getPath('appData'), 'REV Hardware Client 2 Legacy Mac');
let window;
let readyPort = 0;

function status(message) {
  if (!window) return;
  const html = `<!doctype html><meta charset="utf-8"><style>body{font:18px -apple-system,sans-serif;background:#17202a;color:white;display:grid;place-items:center;min-height:90vh;text-align:center}small{display:block;color:#b9c3d0;margin-top:20px}</style><div><h1>REV Hardware Client 2</h1><p>${message.replaceAll('&','&amp;').replaceAll('<','&lt;')}</p><small>Unofficial legacy macOS launcher</small></div>`;
  window.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
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
    readyPort = await ensureBackend(support, vendorApp, java, status);
  }
  await window.loadURL(`http://127.0.0.1:${readyPort}/static/`);
}

if (!app.requestSingleInstanceLock()) app.quit();
else {
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
