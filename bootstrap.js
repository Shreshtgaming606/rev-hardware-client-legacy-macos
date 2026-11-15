'use strict';

const { execFile, execFileSync, spawn } = require('node:child_process');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const { promisify } = require('node:util');

const run = promisify(execFile);
const VERSION = '1.4.6';
const TEAM_ID = '3MTSGT5M96';
const DEFAULT_PORT = 52714;

function cpuName(arch = process.arch) {
  if (arch === 'x64') return 'amd64';
  if (arch === 'arm64') return 'aarch64';
  throw new Error(`Unsupported processor architecture: ${arch}`);
}

function vendorURL(arch = process.arch) {
  return `https://rhc2.revrobotics.com/download/rev-hardware-client-${VERSION}-mac-${cpuName(arch)}.zip`;
}

async function command(binary, args, options = {}) {
  return run(binary, args, { maxBuffer: 8 * 1024 * 1024, ...options });
}

async function download(url, destination) {
  if (!url.startsWith('https://')) throw new Error('The download URL is not HTTPS.');
  await command('/usr/bin/curl', ['--fail', '--location', '--retry', '3', '--silent', '--show-error', '--output', destination, url]);
}

async function verifyVendor(appPath) {
  const plist = path.join(appPath, 'Contents', 'Info.plist');
  const { stdout: id } = await command('/usr/bin/plutil', ['-extract', 'CFBundleIdentifier', 'raw', '-o', '-', plist]);
  if (id.trim() !== 'com.revrobotics.revui.rev-hardware-client') throw new Error('The REV app has an unexpected bundle ID.');
  await command('/usr/bin/codesign', ['--verify', '--strict', appPath]);
  const { stderr } = await command('/usr/bin/codesign', ['-dv', '--verbose=4', appPath]);
  if (!stderr.includes(`TeamIdentifier=${TEAM_ID}`)) throw new Error('The REV app has an unexpected signing team.');
  if (!fs.existsSync(path.join(appPath, 'Contents', 'Resources', `server-${VERSION}-runner.jar`))) {
    throw new Error('The REV backend is missing from the official download.');
  }
}

async function ensureVendor(root, onStatus = () => {}, sourceArchive) {
  const target = path.join(root, 'vendor', 'REV Hardware Client 2.app');
  if (fs.existsSync(target)) {
    await verifyVendor(target);
    return target;
  }
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'rhc2-vendor-'));
  const archive = sourceArchive || path.join(temp, 'official.zip');
  try {
    if (!sourceArchive) {
      onStatus(`Downloading REV Hardware Client 2 ${VERSION} from REV Robotics…`);
      await download(vendorURL(), archive);
    }
    onStatus('Checking and unpacking the official REV download…');
    const unpacked = path.join(temp, 'unpacked');
    fs.mkdirSync(unpacked);
    await command('/usr/bin/ditto', ['-x', '-k', archive, unpacked]);
    const extracted = path.join(unpacked, 'REV Hardware Client 2.app');
    await verifyVendor(extracted);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.renameSync(extracted, target);
    return target;
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
}

function systemJava25() {
  try {
    const home = execFileSync('/usr/libexec/java_home', ['-v', '25'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    const java = path.join(home, 'bin', 'java');
    return fs.existsSync(java) ? java : null;
  } catch { return null; }
}

function findJava(directory, depth = 5) {
  if (depth < 0 || !fs.existsSync(directory)) return null;
  const java = path.join(directory, 'Contents', 'Home', 'bin', 'java');
  if (fs.existsSync(java)) return java;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      const found = findJava(path.join(directory, entry.name), depth - 1);
      if (found) return found;
    }
  }
  return null;
}

async function ensureJava(root, onStatus = () => {}, preferLocal = false) {
  const existing = preferLocal ? null : systemJava25();
  if (existing) return existing;
  const target = path.join(root, 'temurin-jdk-25');
  const cached = findJava(target);
  if (cached) return cached;
  const arch = process.arch === 'arm64' ? 'aarch64' : 'x64';
  const query = `https://api.adoptium.net/v3/assets/latest/25/hotspot?architecture=${arch}&image_type=jdk&os=mac&vendor=eclipse`;
  onStatus('Checking Eclipse Temurin Java 25…');
  const { stdout } = await command('/usr/bin/curl', ['--fail', '--location', '--silent', '--show-error', query]);
  const release = JSON.parse(stdout)[0];
  const pkg = release?.binary?.package;
  if (!pkg?.link?.startsWith('https://github.com/adoptium/') || !/^[0-9a-f]{64}$/.test(pkg?.checksum || '')) {
    throw new Error('The Temurin download information is invalid.');
  }
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'rhc2-java-'));
  try {
    const archive = path.join(temp, 'temurin.tar.gz');
    onStatus('Downloading Eclipse Temurin Java 25…');
    await download(pkg.link, archive);
    const actualHash = crypto.createHash('sha256').update(fs.readFileSync(archive)).digest('hex');
    if (actualHash.toLowerCase() !== pkg.checksum.toLowerCase()) throw new Error('The Java download checksum does not match.');
    onStatus('Unpacking Java 25…');
    const unpacked = path.join(temp, 'unpacked');
    fs.mkdirSync(unpacked);
    await command('/usr/bin/tar', ['-xzf', archive, '-C', unpacked]);
    if (!findJava(unpacked)) throw new Error('The Java download does not contain a Mac JDK.');
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.renameSync(unpacked, target);
    return findJava(target);
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
}

function isReady(port) {
  return new Promise(resolve => {
    if (!Number.isInteger(port) || port < 1 || port > 65535) return resolve(false);
    const req = http.get({ hostname: '127.0.0.1', port, path: '/static/', timeout: 1500 }, res => {
      res.resume();
      resolve(res.statusCode === 200);
    });
    req.on('timeout', () => req.destroy());
    req.on('error', () => resolve(false));
  });
}

async function ensureBackend(root, vendorApp, java, onStatus = () => {}) {
  const portFile = path.join(root, 'backend-port');
  let savedPort = 0;
  try { savedPort = Number(fs.readFileSync(portFile, 'utf8').trim()); } catch {}
  for (const port of [savedPort, DEFAULT_PORT]) if (await isReady(port)) return port;
  const resources = path.join(vendorApp, 'Contents', 'Resources');
  const lib = path.join(vendorApp, 'Contents', 'runtime', 'Contents', 'Home', 'lib');
  const jar = path.join(resources, `server-${VERSION}-runner.jar`);
  const logPath = path.join(root, 'backend.log');
  fs.mkdirSync(root, { recursive: true });
  // REV's backend shows a blocking move-to-Applications dialog whenever
  // app.dir is set and its signed JAR lives outside /Applications. Without
  // app.dir, its static route uses these relative development paths instead.
  const workdir = path.join(root, 'workspace', 'runner');
  const frontend = path.join(workdir, 'frontend-build');
  fs.mkdirSync(frontend, { recursive: true });
  const staticLink = path.join(frontend, 'static');
  if (!fs.existsSync(staticLink)) fs.symlinkSync(path.join(resources, 'static'), staticLink, 'dir');
  for (const arch of ['mac-x64', 'mac-arm64']) {
    const bundled = path.join(root, 'bundled-exes', arch);
    fs.mkdirSync(path.dirname(bundled), { recursive: true });
    if (!fs.existsSync(bundled)) fs.symlinkSync(path.join(vendorApp, 'Contents', 'bin'), bundled, 'dir');
  }
  const adb = path.join(root, 'adb-exes', 'mac');
  fs.mkdirSync(path.dirname(adb), { recursive: true });
  if (!fs.existsSync(adb)) fs.symlinkSync(path.join(vendorApp, 'Contents', 'bin'), adb, 'dir');
  const log = fs.openSync(logPath, 'w');
  const args = [
    '--add-opens=java.base/java.lang=ALL-UNNAMED',
    '-Djava.util.logging.manager=org.jboss.logmanager.LogManager',
    '-Dapp.fsname=rev-hardware-client',
    `-Dapp.version=${VERSION}`,
    '-Dapp.displayName=REV Hardware Client 2',
    '-Dapp.vendor=REV Robotics',
    '-Drev.track=stable',
    '-Djava.net.useSystemProxies=true',
    `-DjSerialComm.library.path=${lib}`,
    `-Djna.boot.library.path=${lib}`,
    `-Djna.library.path=${lib}`,
    `-Djava.library.path=${lib}:${resources}`,
    '-Dquarkus.http.host=127.0.0.1',
    '-jar', jar
  ];
  onStatus('Starting the REV Hardware Client 2 service…');
  const env = { ...process.env, 'revui.bundled-rhc2-ipk': path.join(resources, 'rhc2.ipk') };
  const child = spawn(java, args, { cwd: workdir, env, detached: true, stdio: ['ignore', log, log] });
  fs.closeSync(log);
  child.unref();
  for (let attempt = 0; attempt < 90; attempt++) {
    let port = DEFAULT_PORT;
    try {
      const text = fs.readFileSync(logPath, 'utf8');
      const matches = [...text.matchAll(/Quarkus loaded on port: (\d+)/g)];
      if (matches.length) port = Number(matches.at(-1)[1]);
    } catch {}
    if (await isReady(port)) {
      fs.writeFileSync(portFile, `${port}\n`);
      return port;
    }
    if (child.exitCode !== null) throw new Error(`The REV service stopped. See ${logPath}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error(`The REV service did not become ready. See ${logPath}`);
}

module.exports = { VERSION, cpuName, vendorURL, verifyVendor, ensureVendor, ensureJava, ensureBackend, findJava, systemJava25, isReady };
