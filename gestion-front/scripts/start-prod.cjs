const { spawn } = require('node:child_process');

const port = process.env.PORT || '8080';

const child = spawn(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['ng', 'serve', '--configuration', 'production', '--host', '0.0.0.0', '--port', port],
  {
    stdio: 'inherit',
    shell: false,
    env: process.env
  }
);

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
