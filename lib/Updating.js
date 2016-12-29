'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.start = start;

var _liquid = require('liquid');

var _Polling = require('./Polling');

var Polling = _interopRequireWildcard(_Polling);

var _UpdatingWorker = require('./UpdatingWorker');

var UpdatingWorker = _interopRequireWildcard(_UpdatingWorker);

var _Subscriptions = require('./Subscriptions');

var Subscriptions = _interopRequireWildcard(_Subscriptions);

var _immutable = require('immutable');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const __MODULE__ = 'Updating';

function start() {
  return (0, _liquid.spawn)((() => {
    var _ref = _asyncToGenerator(function* (receive, self) {
      let connectionWorkers = (0, _immutable.Map)();

      Subscriptions.addHandler((() => {
        var _ref2 = _asyncToGenerator(function* ([event, connection, formula]) {
          switch (event) {
            case 'newsub':
              {
                if (!connectionWorkers.get(connection)) {
                  var _UpdatingWorker$start = UpdatingWorker.start(connection);

                  var _UpdatingWorker$start2 = _slicedToArray(_UpdatingWorker$start, 2);

                  const newConnectionWorkerOK = _UpdatingWorker$start2[0];
                  const newConnectionWorkerPID = _UpdatingWorker$start2[1];

                  if (!newConnectionWorkerOK) {
                    throw new Error('Cannot run connection worker', newConnectionWorkerPID);
                  }
                  connectionWorkers = connectionWorkers.set(connection, newConnectionWorkerPID);
                  yield _liquid.Process.link(newConnectionWorkerPID, self);
                  yield _liquid.Process.link(self, newConnectionWorkerPID);
                }
                yield (0, _liquid.send)(connectionWorkers.get(connection), ['newsub', formula]);
                break;
              }

            case 'unsub':
              {
                yield (0, _liquid.send)(connectionWorkers.get(connection), ['unsub', formula]);
                break;
              }

            case 'drop':
              {
                yield _liquid.Process.unlink(connectionWorkers.get(connection), self);
                yield _liquid.Process.unlink(self, connectionWorkers.get(connection));
                yield (0, _liquid.send)(connectionWorkers.get(connection), ['exit', formula]);
                connectionWorkers = connectionWorkers.delete(connection);
                break;
              }
          }
        });

        return function (_x3) {
          return _ref2.apply(this, arguments);
        };
      })());

      Polling.addHandler(function ([formula, newContent]) {
        connectionWorkers.map(function (worker) {
          return (0, _liquid.send)(worker, ['fetched', formula, newContent]);
        });
      });

      yield receive();
    });

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  })(), __MODULE__);
}