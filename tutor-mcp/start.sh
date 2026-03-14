#!/bin/bash
cd /home/al/code/ai-tutorials/tutor-mcp

# Stdio proxy that logs all MCP traffic
node -e "
const { spawn } = require('child_process');
const fs = require('fs');
const log = fs.createWriteStream('/tmp/tutor-mcp-stdio.log');

const child = spawn(process.execPath, [
  '--require', '/home/al/code/ai-tutorials/node_modules/tsx/dist/preflight.cjs',
  '--import', 'file:///home/al/code/ai-tutorials/node_modules/tsx/dist/loader.mjs',
  'server.ts'
], { stdio: ['pipe', 'pipe', 'pipe'] });

process.stdin.pipe(child.stdin);

child.stdout.on('data', d => {
  log.write('[OUT ' + new Date().toISOString() + '] ' + d.toString().trim() + '\n');
  process.stdout.write(d);
});

child.stderr.on('data', d => {
  log.write('[ERR ' + new Date().toISOString() + '] ' + d.toString().trim() + '\n');
});

process.stdin.on('data', d => {
  log.write('[IN  ' + new Date().toISOString() + '] ' + d.toString().trim() + '\n');
});

child.on('exit', code => {
  log.write('[EXIT ' + new Date().toISOString() + '] code=' + code + '\n');
  process.exit(code || 0);
});

process.on('SIGTERM', () => child.kill('SIGTERM'));
process.on('SIGINT', () => child.kill('SIGINT'));
" 2>/tmp/tutor-mcp.log
