"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
const SUBSCRIPTION_POLL_INTERVAL = exports.SUBSCRIPTION_POLL_INTERVAL = process.env.SUBSCRIPTION_POLL_INTERVAL || 10000;
const TARGET_USER_UPDATE_INTERVAL = exports.TARGET_USER_UPDATE_INTERVAL = process.env.TARGET_USER_UPDATE_INTERVAL || 10000;
const MAX_FAILED_FETCH_INTERVAL = exports.MAX_FAILED_FETCH_INTERVAL = process.env.MAX_FAILED_FETCH_INTERVAL || 60000;
const WS_PORT = exports.WS_PORT = process.env.PORT || 8765;