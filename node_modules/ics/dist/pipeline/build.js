"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildEvent = buildEvent;
exports.buildHeader = buildHeader;
var _defaults = require("../defaults");
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function removeUndefined(input) {
  return Object.entries(input).reduce(function (clean, entry) {
    return typeof entry[1] !== 'undefined' ? Object.assign(clean, _defineProperty({}, entry[0], entry[1])) : clean;
  }, {});
}
function buildHeader() {
  var attributes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  // fill in default values where necessary
  var output = Object.assign({}, (0, _defaults.headerDefaults)(), attributes);
  return removeUndefined(output);
}
function buildEvent() {
  var attributes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  // fill in default values where necessary
  var output = Object.assign({}, (0, _defaults.eventDefaults)(), attributes);
  return removeUndefined(output);
}