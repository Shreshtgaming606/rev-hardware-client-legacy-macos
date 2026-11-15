'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { cpuName, vendorURL, findJava, isReady, parseRhcProcesses } = require('./bootstrap');

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
