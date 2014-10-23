module.exports = Adb;

var Socket = require('net').Socket
  , clc    = require('cli-color');

function Adb() {
  if (!(this instanceof Adb)) {
    return new Adb(opt);
  }

  var socket = new Socket();
  socket.on('data'   , onData.bind(this));
  socket.on('connect', onConnect.bind(this));
  socket.on('error'  , onError.bind(this));
  socket.on('end'    , onEnd);

  this.socket = socket;
}

Adb.prototype.connect = function(opt) {
  this.opt = opt;
  this.cmd = prefixLen(['host:connect:localhost:', opt.port].join(''));
  this.socket.connect({
    port : this.opt.adbPort
  });
}

function prefixLen(cmd) {
  var hexlen = cmd.length.toString(16);
  var prefix = ('000'.concat(hexlen)).slice(-4);
  return prefix.concat(cmd);
}

function onData(chunk) {
  var res = chunk.toString();
  if (res.length < 5) return;

  var prefixIdx = res.slice(0, 2) === '00' ? 4 : 8;
  var prefix    = (res.slice(prefixIdx, prefixIdx + 4));

  // unable to connect
  if (prefix === 'unab') {
    notify(clc.red(res.slice(prefixIdx)));
    notify(clc.red('You have to run "adb connect localhost:' + this.opt.port + '" manually.'));
  }
  // failed to connect
  else if (prefix=== 'conn') {
    notify(clc.green(res.slice(prefixIdx)));
  }
  // already connected
  else if (prefix === 'alre') {
    notify(clc.bold(res.slice(prefixIdx)));
  }
}

function notify(msg) {
  process.stdout.write([
    clc.green('!'),
    clc.bold('ADB:'),
    msg,
    require('os').EOL].join(' ')
  );
}

function onConnect() {
  this.socket.write(this.cmd);
}

function onError(err) {
  notify(clc.red("Can't connect to adb-server on port " + this.opt.adbPort));
}

function onEnd() {
}
