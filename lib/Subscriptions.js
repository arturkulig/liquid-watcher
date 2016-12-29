'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.addHandler = addHandler;
exports.removeHandler = removeHandler;
exports.notify = notify;
exports.start = start;

var _liquid = require('liquid');

var _Socket = require('./Socket');

var _Socket2 = _interopRequireDefault(_Socket);

var _immutable = require('immutable');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const __MODULE__ = 'Subscriptions';

function addHandler(handler) {
  return _liquid.GenEvent.addHandler(__MODULE__, handler);
}

function removeHandler(handler) {
  return _liquid.GenEvent.removeHandler(__MODULE__, handler);
}

function notify(handler) {
  return _liquid.GenEvent.notify(__MODULE__, handler);
}

function start() {
  var _GenEvent$start = _liquid.GenEvent.start(__MODULE__);

  var _GenEvent$start2 = _slicedToArray(_GenEvent$start, 1);

  const ok = _GenEvent$start2[0];


  if (!ok) {
    return [false, __MODULE__ + '.start - cannot setup it\'s GenEvent'];
  }

  _Socket2.default.on('connection', connection => {
    console.log('+', connection.id);

    connection.on('subscribe', payload => {
      console.log(' ', connection.id, '+', payload.url);
      notify(['newsub', connection, (0, _immutable.fromJS)(payload)]);
    });
    connection.on('unsubscribe', payload => {
      console.log(' ', connection.id, '-', payload.url);
      notify(['unsub', connection, (0, _immutable.fromJS)(payload)]);
    });
    connection.on('disconnect', () => {
      console.log('-', connection.id);
      notify(['drop', connection]);
    });
  });

  return [ok, __MODULE__];
}