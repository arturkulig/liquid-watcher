'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _socket = require('socket.io');

var _socket2 = _interopRequireDefault(_socket);

var _Config = require('./Config');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const socket = (0, _socket2.default)(_Config.WS_PORT);
console.log('Socket listening on', _Config.WS_PORT);

exports.default = socket;