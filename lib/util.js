var debug_p = require('debug')('packet');

function inspectPacket(chunk) {
  if (!debug_p.enabled) return;

  // adb packet header size.
  var HEADER_SIZE = 24;
  var cmd      = chunk.slice(0 , 4).toString()
    , arg0     = JSON.stringify(chunk.slice(4 , 8 ))
    , arg1     = JSON.stringify(chunk.slice(8 , 12))
    , data_len = parseInt(chunk.slice(12, 16).readInt16LE(0))
    , data_crc = JSON.stringify(chunk.slice(16, 20))
    , magic    = JSON.stringify(chunk.slice(20, 24))
    , msg_len  = HEADER_SIZE + data_len
    , data     = chunk.slice(24, msg_len).toJSON();

  debug_p(cmd + ' ARG0  : ' + arg0);
  debug_p(  '     ARG1  : ' + arg1);
  debug_p(  '     CRC   : ' + data_crc);
  debug_p(  '     MAGIC : ' + magic);
  debug_p(  '     LEN   : ' + chunk.length);
  debug_p(  '     D_LEN : ' + data_len);

  if (msg_len != chunk.length)
    inspectPacket(chunk.slice(msg_len, chunk.length));
}

exports.inspectPacket = inspectPacket;
