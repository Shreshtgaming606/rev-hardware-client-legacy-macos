import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const project = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const target = process.argv[2];
const matrix = {
  'monterey-x64': { label: 'Monterey-Intel', minOS: '12.0', electron: '43.8.10', arch: 'x64' },
  'monterey-arm64': { label: 'Monterey-Apple-Silicon', minOS: '12.0', electron: '43.8.10', arch: 'arm64' },
  'ventura-x64': { label: 'Ventura-Intel', minOS: '13.0', electron: '45.3.2', arch: 'x64' },
  'ventura-arm64': { label: 'Ventura-Apple-Silicon', minOS: '13.0', electron: '45.3.2', arch: 'arm64' },
  'sonoma-x64': { label: 'Sonoma-Intel', minOS: '14.0', electron: '45.3.2', arch: 'x64' },
  'sonoma-arm64': { label: 'Sonoma-Apple-Silicon', minOS: '14.0', electron: '45.3.2', arch: 'arm64' }
};
if (!matrix[target]) {
  console.error(`Usage: npm run build -- <${Object.keys(matrix).join('|')}>`);
  process.exit(2);
}

const spec = matrix[target];
const dist = path.join(project, 'dist');
const cache = path.join(project, '.cache');
fs.mkdirSync(dist, { recursive: true });
fs.mkdirSync(cache, { recursive: true });
const zipName = `electron-v${spec.electron}-darwin-${spec.arch}.zip`;
const electronZip = path.join(cache, zipName);
if (!fs.existsSync(electronZip)) {
  const url = `https://github.com/electron/electron/releases/download/v${spec.electron}/${zipName}`;
  console.log(`Downloading Electron ${spec.electron} for ${spec.arch}`);
  execFileSync('/usr/bin/curl', ['--fail', '--location', '--retry', '3', '--silent', '--show-error', '--output', electronZip, url], { stdio: 'inherit' });
}

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'rhc2-build-'));
const appName = 'REV Hardware Client 2 Legacy Mac.app';
const builtApp = path.join(temp, appName);
try {
  execFileSync('/usr/bin/ditto', ['-x', '-k', electronZip, temp], { stdio: 'inherit' });
  fs.renameSync(path.join(temp, 'Electron.app'), builtApp);
  const resources = path.join(builtApp, 'Contents', 'Resources');
  const appSources = path.join(resources, 'app');
  fs.mkdirSync(appSources);
  for (const name of ['main.js', 'bootstrap.js', 'package.json']) fs.copyFileSync(path.join(project, name), path.join(appSources, name));
  fs.copyFileSync(path.join(project, 'assets', 'legacy.icns'), path.join(resources, 'legacy.icns'));
  const plist = path.join(builtApp, 'Contents', 'Info.plist');
  const set = (key, value) => execFileSync('/usr/libexec/PlistBuddy', ['-c', `Set :${key} ${value}`, plist], { stdio: 'inherit' });
  set('CFBundleDisplayName', 'REV Hardware Client 2 Legacy Mac');
  set('CFBundleName', 'REV Hardware Client 2 Legacy Mac');
  set('CFBundleIdentifier', 'io.github.shreshtgaming606.rhc2-legacy-mac');
  set('CFBundleIconFile', 'legacy.icns');
  set('CFBundleShortVersionString', '0.1.0');
  set('CFBundleVersion', '1');
  set('LSMinimumSystemVersion', spec.minOS);
  execFileSync('/usr/bin/codesign', ['--force', '--deep', '--sign', '-', builtApp], { stdio: 'inherit' });
  execFileSync('/usr/bin/codesign', ['--verify', '--deep', '--strict', builtApp], { stdio: 'inherit' });
  const output = path.join(dist, `REV-Hardware-Client-2-Legacy-${spec.label}-v0.1.0.zip`);
  execFileSync('/usr/bin/ditto', ['-c', '-k', '--sequesterRsrc', '--keepParent', builtApp, output], { stdio: 'inherit' });
  console.log(output);
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
