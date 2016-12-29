'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.start = start;
exports.register = register;
exports.notify = notify;

var _liquid = require('liquid');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function start(name) {
  return (0, _liquid.spawn)((() => {
    var _ref = _asyncToGenerator(function* (receive) {
      let observerPIDs = [];

      while (true) {
        const message = yield receive();

        var _message = _toArray(message);

        const command = _message[0];

        const args = _message.slice(1);

        switch (command) {
          case 'register':
            {
              var _args = _slicedToArray(args, 1);

              const pid = _args[0];

              observerPIDs = [pid].concat(_toConsumableArray(observerPIDs));
              break;
            }

          case 'message':
            {
              var _args2 = _slicedToArray(args, 1);

              const messageForObserver = _args2[0];

              console.log('<', name);
              yield Promise.all(observerPIDs.map(function (observerPID) {
                return (0, _liquid.send)(observerPID, messageForObserver);
              }));
            }
        }
      }
    });

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  })(), name);
}

function register(broadcastPID, clientPID) {
  return (0, _liquid.send)(broadcastPID, ['register', clientPID]);
}

function notify(broadcastPID, message) {
  return (0, _liquid.send)(broadcastPID, ['message', message]);
}