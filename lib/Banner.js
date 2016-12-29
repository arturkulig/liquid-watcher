'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _liquid = require('liquid');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var _process = process;
const stdout = _process.stdout;


const Banner = _asyncToGenerator(function* () {
  stdout.write('\n\n\n');
  for (let letter of ['Night gathers, and now my watch begins.', 'It shall not end until my death.', 'I shall take no wife, hold no lands, father no children.', 'I shall wear no crowns and win no glory.', 'I shall live and die at my post.', 'I am the sword in the darkness.', 'I am the watcher on the walls.', 'I am the fire that burns against the cold,', 'the light that brings the dawn,', 'the horn that wakes the sleepers,', 'the shield that guards the realms of men.', 'I pledge my life and honor to the Night\'s Watch,', 'for this night and all the nights to come.'].join('\n').split('')) {
    yield (0, _liquid.timeout)(1000 / 120);
    if (letter === '\n') {
      yield (0, _liquid.timeout)(300);
    }
    stdout.write(letter);
  }
  stdout.write('\n\n\n');
  resolve();
})();

exports.default = Banner;