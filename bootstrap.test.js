'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { cpuName, vendorURL, findJava, isReady } = require('./bootstrap');

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
