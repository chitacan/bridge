module.exports = Client;

var net   = require('net')
  , u     = require('url')
  , os    = require('os')
  , rest  = require('restler')
  , Adb   = require('./adb')
  , util  = require('../util')
  , debug = require('debug')
  , clc   = require('cli-color')
  , debug_a = debug('client:adb')
  , debug_p = debug('client:packet')
  , debug_c = debug('client:bridge');

function Client(opt) {
  if (!(this instanceof Client)) {
    return new Client(opt);
  }

  this.opt = opt;
  this.server = this.createServer();
  this.socket = this.createSocket();
  this.adb = new Adb();

  return this;
}

Client.prototype.createServer = function() {
  var self        = this;
  var isConnected = function() {
    if (!!self.socket && self.socket.connected) return true;
    return false;
  }

  var server = net.createServer(function(c) {
    server.socket = c;
    debug_a('connected');
    self.socket.emit('bc-client-connected');
    c.on('close', function() {
      debug_a('disconnected');
      if (isConnected())
        self.socket.emit('bc-collapse');
    });
    c.on('data', function(chunk) {
      if (isConnected()) {
        util.inspectPacket(chunk);
        self.socket.emit('bc-data', { binary: chunk });
      }
    });
    c.on('error', function(e) {
      debug_a(e);
    });
  });
  server.maxConnection = 1;
  server.listen(this.opt.port, function() {
    self.opt.port = this.address().port;
    var msg = [
      clc.green('!'),
      clc.bold('Listening on port:'),
      clc.cyan(self.opt.port),
    ].join(' ');
    process.stdout.write(msg + require('os').EOL);
  });

  return server;
}

Client.prototype.createSocket = function() {
  var self        = this;
  var url         = u.resolve(this.opt.url, 'bridge/client');
  var daemonId    = this.opt.daemonId;
  var socket      = require('socket.io-client')(url);
  var isConnected = function() {
    if (!!self.server.socket && self.server.socket.writable)
      return true;
    return false;
  }

  debug_c('connecting to : ' + url);

  socket.on('connect', function(){
    debug_c('connected');
    socket.emit('bc-host', {
      type     : os.type(),
      arch     : os.arch(),
      hostname : os.hostname(),
      version  : os.release(),
      daemonId : daemonId
    });
    self.adb.connect(self.opt);
  });
  socket.on('bs-collapse', function() {
    if (isConnected()) {
      self.server.socket.end();
      self.server.socket.destroy();
    }
  });
  socket.on('data', function(data){
    debug_c('client data');
  });
  socket.on('disconnect', function(){
    self.opt.daemonId = '';
    debug_c('disconnected');
  });
  socket.on('bs-data', function(data) {
    if (isConnected()) {
      util.inspectPacket(data.binary);
      self.server.socket.write(data.binary);
    }
  });
  socket.on('error', function(e) {
    debug_c(e);
  });

  return socket;
}

function installBridge(url, ids) {
  url = u.resolve(url, 'api/bridge');
  rest.put(url, { data: ids })
  .on('complete', function(data) {
  });
}
