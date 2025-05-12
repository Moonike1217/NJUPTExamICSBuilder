"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.headerDefaults = exports.eventDefaults = void 0;
var _nanoid = require("nanoid");
var headerDefaults = exports.headerDefaults = function headerDefaults() {
  return {
    productId: 'adamgibbons/ics',
    method: 'PUBLISH'
  };
};
var eventDefaults = exports.eventDefaults = function eventDefaults() {
  return {
    title: 'Untitled event',
    uid: (0, _nanoid.nanoid)(),
    timestamp: Date.now()
  };
};