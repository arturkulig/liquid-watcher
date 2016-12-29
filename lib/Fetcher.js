'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.goGet = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

let retryLater = (() => {
  var _ref8 = _asyncToGenerator(function* (formula, receiverPID, trial) {
    const nextTrialTimeout = Math.min(_Config.MAX_FAILED_FETCH_INTERVAL, Math.pow(2, trial));
    console.log('  ' + __MODULE__ + ' HTTP FAIL', formula.get('url'), 'RETRY IN', nextTrialTimeout);

    yield (0, _liquid.timeout)(nextTrialTimeout);
    yield goGet(formula, receiverPID, trial);
  });

  return function retryLater(_x2, _x3, _x4) {
    return _ref8.apply(this, arguments);
  };
})();

let goGet = exports.goGet = (() => {
  var _ref9 = _asyncToGenerator(function* (formula, receiverPID, trial = 0) {
    yield (0, _liquid.send)(__MODULE__, [formula, receiverPID, trial]);
  });

  return function goGet(_x5, _x6, _x7) {
    return _ref9.apply(this, arguments);
  };
})();

let failFreeCall = (() => {
  var _ref10 = _asyncToGenerator(function* (f) {
    try {
      const result = yield f.apply(null);
      return [true, result];
    } catch (e) {
      return [false, e];
    }
  });

  return function failFreeCall(_x8) {
    return _ref10.apply(this, arguments);
  };
})();

exports.start = start;

var _liquid = require('liquid');

var _nodeFetch = require('node-fetch');

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

var _Config = require('./Config');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const __MODULE__ = 'Fetcher';

function start() {
  var _spawn = (0, _liquid.spawn)((() => {
    var _ref = _asyncToGenerator(function* (receive) {
      while (true) {
        var _ref2 = yield receive();

        var _ref3 = _slicedToArray(_ref2, 3);

        const formula = _ref3[0];
        const receiverPID = _ref3[1];
        const trial = _ref3[2];

        var _formula$toJS = formula.toJS();

        const url = _formula$toJS.url;

        const opts = _objectWithoutProperties(_formula$toJS, ['url']);

        var _ref4 = yield failFreeCall(function () {
          return (0, _nodeFetch2.default)(url, opts);
        });

        var _ref5 = _slicedToArray(_ref4, 2);

        const fetched = _ref5[0];
        const response = _ref5[1];

        if (!fetched || response.status >= 400) {
          retryLater(formula, receiverPID, trial + 1);
          continue;
        }

        var _ref6 = yield failFreeCall(function () {
          return response.text();
        });

        var _ref7 = _slicedToArray(_ref6, 2);

        const ok = _ref7[0];
        const content = _ref7[1];

        if (!ok || !content) {
          retryLater(formula, receiverPID, trial + 1);
          continue;
        }

        console.log('< Fetcher HTTP', response.status, opts.method || 'GET', url);
        yield (0, _liquid.send)(receiverPID, ['Fetcher:fetched', content]);
      }
    });

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  })(), __MODULE__);

  var _spawn2 = _slicedToArray(_spawn, 1);

  const ok = _spawn2[0];


  if (!ok) {
    return [false, __MODULE__ + '.start could not run process'];
  }

  return [true, __MODULE__];
}