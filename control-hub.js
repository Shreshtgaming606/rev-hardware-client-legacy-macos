'use strict';

const { execFile, execFileSync } = require('node:child_process');
const http = require('node:http');
const path = require('node:path');
const { promisify } = require('node:util');

const run = promisify(execFile);
let activeForward = null;

function parseControlHubs(output) {
  return output.split('\n').flatMap(line => {
    const match = line.match(/^(\S+)\s+device\s+(.+)$/);
    if (!match || !/\busb:/.test(match[2]) || !/\b(?:model:Control_Hub|product:ch_v\d+_box)/i.test(match[2])) return [];
    return [match[1]];
  });
}

function consoleReady(port) {
  return new Promise(resolve => {
    const request = http.get({ hostname: '127.0.0.1', port, path: '/', timeout: 2000 }, response => {
      response.resume();
      resolve(response.statusCode === 200);
    });
    request.on('timeout', () => request.destroy());
    request.on('error', () => resolve(false));
  });
}

function stopControlHub() {
  if (!activeForward) return;
  const { adb, serial, port } = activeForward;
  activeForward = null;
  try { execFileSync(adb, ['-s', serial, 'forward', '--remove', `tcp:${port}`], { timeout: 5000, stdio: 'ignore' }); }
  catch { /* ADB may already have removed the forward after unplugging. */ }
}

async function connectControlHub(vendorApp, onStatus = () => {}) {
  if (activeForward && await consoleReady(activeForward.port)) return activeForward;
  stopControlHub();
  const adb = path.join(vendorApp, 'Contents', 'bin', 'adb');
  const { stdout } = await run(adb, ['devices', '-l'], { timeout: 10000 });
  const serial = parseControlHubs(stdout)[0];
  if (!serial) return null;
  onStatus('Connecting to the FTC Control Hub…');
  const { stdout: assigned } = await run(adb, ['-s', serial, 'forward', 'tcp:0', 'tcp:8080'], { timeout: 10000 });
  const port = Number(assigned.trim());
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('ADB did not assign a local Control Hub port.');
  activeForward = { adb, serial, port };
  for (let attempt = 0; attempt < 10; attempt++) {
    if (await consoleReady(port)) return activeForward;
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  stopControlHub();
  throw new Error('The FTC Control Hub is connected by USB, but its Robot Controller Console is unavailable.');
}

module.exports = { parseControlHubs, connectControlHub, stopControlHub };
