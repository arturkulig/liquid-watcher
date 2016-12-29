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

var _Subscriptions = require('./Subscriptions');

var Subscriptions = _interopRequireWildcard(_Subscriptions);

var _immutable = require('immutable');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

const __MODULE__ = 'SubscriptionsAll';

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

  Subscriptions.addHandler(event => {
    var _event = _toArray(event);

    const cmd = _event[0];

    const args = _event.slice(1);

    switch (cmd) {
      case 'newsub':
        {
          var _args = _slicedToArray(args, 2);

          const connection = _args[0];
          const formula = _args[1];

          formulas = formulas.set(formula, formulas.get(formula, (0, _immutable.Set)()).add(connection));
          notify(formulas);
          break;
        }

      case 'unsub':
        {
          var _args2 = _slicedToArray(args, 2);

          const connection = _args2[0];
          const formula = _args2[1];

          formulas = formulas.set(formula, formulas.get(formula, (0, _immutable.Set)()).remove(connection)).filter(connections => !!connections.count());
          notify(formulas);
          break;
        }

      case 'drop':
        {
          var _args3 = _slicedToArray(args, 1);

          const connection = _args3[0];

          formulas = formulas.map(connections => connections.remove(connection)).filter(connections => !!connections.count());
          notify(formulas);
          break;
        }
    }
  });

  return [true, __MODULE__];
}