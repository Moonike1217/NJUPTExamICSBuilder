"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = encodeNewLines;
function encodeNewLines(text) {
  return text.replace(/\r?\n/gm, "\\n");
}