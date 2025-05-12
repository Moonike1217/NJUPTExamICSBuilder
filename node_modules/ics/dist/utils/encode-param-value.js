"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = encodeParamValue;
function encodeParamValue(value) {
  return "\"".concat(value.replaceAll('"', '\\"'), "\"");
}