'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.start = start;

var _liquid = require('liquid');

var _Config = require('./Config');

var _immutable = require('immutable');

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function start(connection) {
  return (0, _liquid.spawn)((() => {
    var _ref = _asyncToGenerator(function* (receive) {
      let lastClientNotification = Date.now();
      let contents = (0, _immutable.Map)();

      while (true) {
        var _ref2 = yield receive();

        var _ref3 = _toArray(_ref2);

        const command = _ref3[0];

        const args = _ref3.slice(1);

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

                const silenceEnd = (0, _liquid.timeout)(Math.min(_Config.TARGET_USER_UPDATE_INTERVAL, (Date.now() - lastClientNotification) / 2));
                lastClientNotification = Date.now();
                yield silenceEnd;
              }
              break;
            }
        }
      }
    });

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  })());
}