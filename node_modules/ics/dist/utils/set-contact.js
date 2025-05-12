"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = setContact;
var _encodeParamValue = _interopRequireDefault(require("./encode-param-value"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function setContact(_ref) {
  var name = _ref.name,
    email = _ref.email,
    rsvp = _ref.rsvp,
    dir = _ref.dir,
    partstat = _ref.partstat,
    role = _ref.role,
    cutype = _ref.cutype,
    xNumGuests = _ref.xNumGuests;
  var formattedParts = [];
  if (rsvp !== undefined) {
    formattedParts.push(rsvp ? 'RSVP=TRUE' : 'RSVP=FALSE');
  }
  if (cutype) {
    formattedParts.push("CUTYPE=".concat((0, _encodeParamValue["default"])(cutype)));
  }
  if (xNumGuests !== undefined) {
    formattedParts.push("X-NUM-GUESTS=".concat(xNumGuests));
  }
  if (role) {
    formattedParts.push("ROLE=".concat((0, _encodeParamValue["default"])(role)));
  }
  if (partstat) {
    formattedParts.push("PARTSTAT=".concat((0, _encodeParamValue["default"])(partstat)));
  }
  if (dir) {
    formattedParts.push("DIR=".concat((0, _encodeParamValue["default"])(dir)));
  }
  formattedParts.push('CN='.concat((0, _encodeParamValue["default"])(name || 'Unnamed attendee')));
  var formattedAttendee = formattedParts.join(';').concat(email ? ":mailto:".concat(email) : '');
  return formattedAttendee;
}