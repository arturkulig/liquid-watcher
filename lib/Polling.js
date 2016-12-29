'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

let quitWorkers = (() => {
  var _ref2 = _asyncToGenerator(function* (workers) {
    yield Promise.all(workers.toArray().map(quitWorker));
  });

  return function quitWorkers(_x2) {
    return _ref2.apply(this, arguments);
  };
})();

let quitWorker = (() => {
  var _ref3 = _asyncToGenerator(function* (worker) {
    yield (0, _liquid.send)(worker, ['parent:exit']);
  });

  return function quitWorker(_x3) {
    return _ref3.apply(this, arguments);
  };
})();

let reemitWorkers = (() => {
  var _ref4 = _asyncToGenerator(function* (workers) {
    yield Promise.all(workers.toArray().map(reemitWorker));
  });

  return function reemitWorkers(_x4) {
    return _ref4.apply(this, arguments);
  };
})();

let reemitWorker = (() => {
  var _ref5 = _asyncToGenerator(function* (worker) {
    yield (0, _liquid.send)(worker, ['parent:reemit']);
  });

  return function reemitWorker(_x5) {
    return _ref5.apply(this, arguments);
  };
})();

exports.addHandler = addHandler;
exports.start = start;

var _liquid = require('liquid');

var _SubscriptionsAll = require('./SubscriptionsAll');

var SubscriptionsAll = _interopRequireWildcard(_SubscriptionsAll);

var _PollingWorker = require('./PollingWorker');

var PollingWorker = _interopRequireWildcard(_PollingWorker);

var _immutable = require('immutable');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const __MODULE__ = 'POLLING';

function addHandler(handler) {
  GenEvent.addHandler(__MODULE__, handler);
}

function start() {
  let ok, reason;

  var _GenEvent$start = GenEvent.start(__MODULE__);

  var _GenEvent$start2 = _slicedToArray(_GenEvent$start, 2);

  ok = _GenEvent$start2[0];
  reason = _GenEvent$start2[1];


  if (!ok) {
    return [false, reason];
  }

  let formulas = null;
  let currentFormulasWorkers = (0, _immutable.Map)();
  SubscriptionsAll.addHandler((() => {
    var _ref = _asyncToGenerator(function* (connectionsByFormulas) {
      console.log('> POLLING SUBS');

      const nextFormulas = keysOfSet(connectionsByFormulas);

      const nextFormulasWorkers = nextFormulas.reduce(function (result, item) {
        return result.set(item, item);
      }, (0, _immutable.Map)()).map(function (formula) {
        return currentFormulasWorkers.get(formula) || PollingWorker.start(formula, __MODULE__);
      });

      yield quitWorkers(pick(currentFormulasWorkers, subtractSets(formulas, nextFormulas)));

      yield reemitWorkers(nextFormulasWorkers);

      console.log('  POLLING', nextFormulas.count(), 'workers');

      formulas = nextFormulas;
      currentFormulasWorkers = nextFormulasWorkers;
    });

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  })());

  return [true, __MODULE__];
}

function keysOfSet(collection) {
  return collection.keySeq().toSet();
}

function pick(collection, keys) {
  return collection.filter((item, key) => keys.includes(key));
}

function subtractSets(collection, toRemove) {
  return (collection || (0, _immutable.Set)()).filter(formula => !toRemove.includes(formula));
}