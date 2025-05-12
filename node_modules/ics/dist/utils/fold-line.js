"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = foldLine;
var _runes = require("runes2");
function foldLine(line) {
  var parts = [];
  var length = 75;
  while ((0, _runes.runes)(line).length > length) {
    parts.push((0, _runes.substring)(line, 0, length));
    line = (0, _runes.substring)(line, length);
    length = 74;
  }
  parts.push(line);
  return parts.join('\r\n\t');
}