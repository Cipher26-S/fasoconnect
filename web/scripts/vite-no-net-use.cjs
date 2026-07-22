const childProcess = require('node:child_process');

const originalExec = childProcess.exec;

childProcess.exec = function exec(command, options, callback) {
  if (command === 'net use') {
    const done = typeof options === 'function' ? options : callback;
    if (done) {
      process.nextTick(() => done(null, '', ''));
    }
    return {
      stdout: { on() {} },
      stderr: { on() {} },
      on() {},
      once() {},
      kill() {},
    };
  }

  return originalExec.apply(this, arguments);
};
