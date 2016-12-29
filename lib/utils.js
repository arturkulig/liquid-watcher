"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.timeout = timeout;
function timeout(interval = 0) {
  return new Promise(resolve => setTimeout(resolve, interval));
}