'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _liquid = require('liquid');

var _Subscriptions = require('./Subscriptions');

var Subscriptions = _interopRequireWildcard(_Subscriptions);

var _SubscriptionsAll = require('./SubscriptionsAll');

var SubscriptionsAll = _interopRequireWildcard(_SubscriptionsAll);

var _Fetcher = require('./Fetcher');

var Fetcher = _interopRequireWildcard(_Fetcher);

var _Polling = require('./Polling');

var Polling = _interopRequireWildcard(_Polling);

var _Updating = require('./Updating');

var Updating = _interopRequireWildcard(_Updating);

var _Banner = require('./Banner');

var _Banner2 = _interopRequireDefault(_Banner);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

_asyncToGenerator(function* () {
  yield _Banner2.default;

  var _Supervisor$start = _liquid.Supervisor.start([Subscriptions, SubscriptionsAll, Fetcher, Polling, Updating], {
    strategy: 'one_for_rest',
    name: 'Main'
  });

  var _Supervisor$start2 = _slicedToArray(_Supervisor$start, 2);

  const ok = _Supervisor$start2[0];
  const sv = _Supervisor$start2[1];


  if (!ok) {
    console.error('MainLoop start fail', sv);
  }

  try {
    yield _liquid.Process.end(app);
    console.log('MainLoop exit', result);
  } catch (reason) {
    console.log('MainLoop error', reason);
  }
  yield (0, _liquid.timeout)(1000);
})();