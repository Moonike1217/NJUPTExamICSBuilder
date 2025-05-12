"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = setOrganizer;
var _encodeParamValue = _interopRequireDefault(require("./encode-param-value"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function setOrganizer(_ref) {
  var name = _ref.name,
    email = _ref.email,
    dir = _ref.dir,
    sentBy = _ref.sentBy;
  var formattedOrganizer = '';
  formattedOrganizer += dir ? "DIR=".concat((0, _encodeParamValue["default"])(dir), ";") : '';
  formattedOrganizer += sentBy ? "SENT-BY=".concat((0, _encodeParamValue["default"])("MAILTO:".concat(sentBy)), ";") : '';
  formattedOrganizer += 'CN=';
  formattedOrganizer += (0, _encodeParamValue["default"])(name || 'Organizer');
  formattedOrganizer += email ? ":MAILTO:".concat(email) : '';
  return formattedOrganizer;
}