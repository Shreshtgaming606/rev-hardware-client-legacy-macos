'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { cpuName, vendorURL, findJava, isReady, parseRhcProcesses } = require('./bootstrap');
const { parseControlHubs } = require('./control-hub');

test('vendor downloads match each Mac processor', () => {
  assert.equal(cpuName('x64'), 'amd64');
  assert.equal(cpuName('arm64'), 'aarch64');
  assert.match(vendorURL('x64'), /mac-amd64\.zip$/);
  assert.match(vendorURL('arm64'), /mac-aarch64\.zip$/);
  assert.throws(() => cpuName('ia32'), /Unsupported/);
});

test('absent Java and backend are reported as absent', async () => {
  assert.equal(findJava('/definitely/not/a/jdk'), null);
  assert.equal(await isReady(0), false);
});

test('recognizes a REV backend whose app path contains spaces', () => {
  const line = '64487 /Library/Java/bin/java -Dapp.fsname=rev-hardware-client -jar /Applications/REV Hardware Client 2.app/Contents/Resources/server-1.4.6-runner.jar';
  assert.deepEqual(parseRhcProcesses(line), [{
    pid: 64487,
    jar: '/Applications/REV Hardware Client 2.app/Contents/Resources/server-1.4.6-runner.jar'
  }]);
  assert.deepEqual(parseRhcProcesses('100 /bin/other -jar /tmp/server-1.4.6-runner.jar'), []);
});

test('recognizes an FTC Control Hub on USB through ADB', () => {
  const listing = 'List of devices attached\n6b3b42fa5163b048 device usb:337776640X product:ch_v1_box model:Control_Hub_v1_0 device:rk3328_box transport_id:1\n'
    + '192.168.43.1:5555 device product:ch_v1_box model:Control_Hub_v1_0\n'
    + 'ABC123 unauthorized usb:42 model:Control_Hub_v1_0\n';
  assert.deepEqual(parseControlHubs(listing), ['6b3b42fa5163b048']);
});
