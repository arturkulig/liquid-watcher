'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

let reFetch = (() => {
  var _ref4 = _asyncToGenerator(function* (formula, workerPID) {
    yield (0, _liquid.timeout)(formula.get('interval', _Config.SUBSCRIPTION_POLL_INTERVAL) | 0);
    Fetcher.goGet(formula, workerPID);
  });

  return function reFetch(_x3, _x4) {
    return _ref4.apply(this, arguments);
  };
})();

exports.start = start;

var _liquid = require('liquid');

var _Fetcher = require('./Fetcher');

var Fetcher = _interopRequireWildcard(_Fetcher);

var _Config = require('./Config');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function start(formula, pollingEventPID) {
  var _spawn = (0, _liquid.spawn)((() => {
    var _ref = _asyncToGenerator(function* (receive, self) {
      console.log('+ POLL WORKER NEW', formula.get('url'));

      Fetcher.goGet(formula, self);

      let content = null;

      while (true) {
        var _ref2 = yield receive();

        var _ref3 = _toArray(_ref2);

        const command = _ref3[0];

        const args = _ref3.slice(1);

        switch (command) {
          case 'parent:exit':
            {
              console.log('- POLL WORKER EXIT', formula.get('url'));
              return;
            }

          case 'parent:reemit':
            {
              if (content) {
                console.log('< POLL WORKER REEMIT', formula.get('url'));
                _liquid.GenEvent.notify(pollingEventPID, [formula, content]);
              }
              break;
            }

          case 'Fetcher:fetched':
            {
              var _args = _slicedToArray(args, 1);

              content = _args[0];


              console.log('< POLL WORKER EMIT', formula.get('url'));
              _liquid.GenEvent.notify(pollingEventPID, [formula, content]);

              reFetch(formula, self);

              break;
            }
        }
      }
    });

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  })());

  var _spawn2 = _slicedToArray(_spawn, 2);

  const pid = _spawn2[1];


  return pid;
}