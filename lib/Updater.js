'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.start = start;

var _liquid = require('liquid');

var _Polling = require('./Polling');

var Polling = _interopRequireWildcard(_Polling);

var _Subscriptions = require('./Subscriptions');

var Subscriptions = _interopRequireWildcard(_Subscriptions);

var _Config = require('./Config');

var _Utils = require('./Utils');

var _immutable = require('immutable');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const __MODULE__ = 'Updater';

function start() {
  let ok;

  var _spawn = (0, _liquid.spawn)((() => {
    var _ref = _asyncToGenerator(function* (receive) {
      let connectionWorkers = (0, _immutable.Map)();

      while (true) {
        var _ref2 = yield receive();

        var _ref3 = _slicedToArray(_ref2, 2);

        const source = _ref3[0];
        const message = _ref3[1];


        console.log('> UPDATER', source);

        switch (source) {
          case 'subscriptions':
            {
              var _message = _slicedToArray(message, 3);

              const event = _message[0];
              const connection = _message[1];
              const formula = _message[2];


              switch (event) {
                case 'newsub':
                  {
                    if (!connectionWorkers.get(connection)) {
                      connectionWorkers = connectionWorkers.set(connection, startUpdaterWorker(connection));
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
                    yield (0, _liquid.send)(connectionWorkers.get(connection), ['exit', formula]);
                    break;
                  }
              }
              break;
            }

          case 'polling':
            {
              var _message2 = _slicedToArray(message, 2);

              const formula = _message2[0];
              const newContent = _message2[1];

              connectionWorkers.map(function (worker) {
                return (0, _liquid.send)(worker, ['fetched', formula, newContent]);
              });
              break;
            }
        }
      }
    });

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  })(), __MODULE__);

  var _spawn2 = _slicedToArray(_spawn, 1);

  ok = _spawn2[0];

  if (!ok) {
    return [false, __MODULE__ + '.start cannot start messages sender'];
  }

  var _spawn3 = (0, _liquid.spawn)((() => {
    var _ref4 = _asyncToGenerator(function* (receive, self) {
      Subscriptions.register(self);
      while (true) {
        yield (0, _liquid.send)(__MODULE__, ['subscriptions', yield receive()]);
      }
    });

    return function (_x2, _x3) {
      return _ref4.apply(this, arguments);
    };
  })());

  var _spawn4 = _slicedToArray(_spawn3, 1);

  ok = _spawn4[0];

  if (!ok) {
    return [false, __MODULE__ + '.start cannot start subscriptions receiver'];
  }

  var _spawn5 = (0, _liquid.spawn)((() => {
    var _ref5 = _asyncToGenerator(function* (receive, self) {
      Polling.register(self);
      while (true) {
        yield (0, _liquid.send)(__MODULE__, ['polling', yield receive()]);
      }
    });

    return function (_x4, _x5) {
      return _ref5.apply(this, arguments);
    };
  })());

  var _spawn6 = _slicedToArray(_spawn5, 1);

  ok = _spawn6[0];

  if (!ok) {
    return [false, __MODULE__ + '.start cannot start polling receiver'];
  }

  return [true, __MODULE__];
}

function startUpdaterWorker(connection) {
  var _spawn7 = (0, _liquid.spawn)((() => {
    var _ref6 = _asyncToGenerator(function* (receive) {
      let contents = (0, _immutable.Map)();

      while (true) {
        var _ref7 = yield receive();

        var _ref8 = _toArray(_ref7);

        const command = _ref8[0];

        const args = _ref8.slice(1);

        switch (command) {
          case 'exit':
            return;
          case 'unsub':
            {
              var _args = _slicedToArray(args, 1);

              const formula = _args[0];

              contents = contents.remove(formula);
              break;
            }
          case 'newsub':
            {
              var _args2 = _slicedToArray(args, 1);

              const formula = _args2[0];

              contents = contents.set(formula, null);
              break;
            }
          case 'fetched':
            {
              var _args3 = _slicedToArray(args, 2);

              const formula = _args3[0];
              const content = _args3[1];

              if (contents.has(formula) && contents.get(formula) !== content) {
                contents = contents.set(formula, content);

                connection.emit('content', { formula: formula.toJS(), content });

                console.log('> SOCKET', connection.id, formula.get('url'), content.substr(0, 32).replace(/\r/g, '').replace(/\n/g, ''));

                yield (0, _Utils.timeout)(_Config.SUBSCRIPTION_POLL_INTERVAL / Math.max(1, contents.count()));
              }
              break;
            }
        }
      }
    });

    return function (_x6) {
      return _ref6.apply(this, arguments);
    };
  })());

  var _spawn8 = _slicedToArray(_spawn7, 2);

  const pid = _spawn8[1];

  return pid;
}