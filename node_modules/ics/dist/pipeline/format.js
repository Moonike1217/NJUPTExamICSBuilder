"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formatEvent = formatEvent;
exports.formatFooter = formatFooter;
exports.formatHeader = formatHeader;
var _utils = require("../utils");
var _encodeNewLines = _interopRequireDefault(require("../utils/encode-new-lines"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function formatHeader() {
  var attributes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var productId = attributes.productId,
    method = attributes.method,
    calName = attributes.calName;
  var icsFormat = '';
  icsFormat += 'BEGIN:VCALENDAR\r\n';
  icsFormat += 'VERSION:2.0\r\n';
  icsFormat += 'CALSCALE:GREGORIAN\r\n';
  icsFormat += (0, _utils.foldLine)("PRODID:".concat((0, _encodeNewLines["default"])(productId))) + '\r\n';
  icsFormat += (0, _utils.foldLine)("METHOD:".concat((0, _encodeNewLines["default"])(method))) + '\r\n';
  icsFormat += calName ? (0, _utils.foldLine)("X-WR-CALNAME:".concat((0, _encodeNewLines["default"])(calName))) + '\r\n' : '';
  icsFormat += "X-PUBLISHED-TTL:PT1H\r\n";
  return icsFormat;
}
function formatFooter() {
  return "END:VCALENDAR\r\n";
}
function formatEvent() {
  var attributes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var title = attributes.title,
    uid = attributes.uid,
    sequence = attributes.sequence,
    timestamp = attributes.timestamp,
    start = attributes.start,
    startType = attributes.startType,
    startInputType = attributes.startInputType,
    startOutputType = attributes.startOutputType,
    duration = attributes.duration,
    end = attributes.end,
    endInputType = attributes.endInputType,
    endOutputType = attributes.endOutputType,
    description = attributes.description,
    url = attributes.url,
    geo = attributes.geo,
    location = attributes.location,
    status = attributes.status,
    categories = attributes.categories,
    organizer = attributes.organizer,
    attendees = attributes.attendees,
    alarms = attributes.alarms,
    recurrenceRule = attributes.recurrenceRule,
    exclusionDates = attributes.exclusionDates,
    busyStatus = attributes.busyStatus,
    transp = attributes.transp,
    classification = attributes.classification,
    created = attributes.created,
    lastModified = attributes.lastModified,
    htmlContent = attributes.htmlContent;
  var icsFormat = '';
  icsFormat += 'BEGIN:VEVENT\r\n';
  icsFormat += (0, _utils.foldLine)("UID:".concat((0, _encodeNewLines["default"])(uid))) + '\r\n';
  icsFormat += title ? (0, _utils.foldLine)("SUMMARY:".concat((0, _encodeNewLines["default"])((0, _utils.setSummary)(title)))) + '\r\n' : '';
  icsFormat += (0, _utils.foldLine)("DTSTAMP:".concat((0, _encodeNewLines["default"])((0, _utils.formatDate)(timestamp)))) + '\r\n';

  // All day events like anniversaries must be specified as VALUE type DATE
  icsFormat += (0, _utils.foldLine)("DTSTART".concat(start && start.length == 3 ? ";VALUE=DATE" : "", ":").concat((0, _encodeNewLines["default"])((0, _utils.formatDate)(start, startOutputType || startType, startInputType)))) + '\r\n';

  // End is not required for all day events on single days (like anniversaries)
  if (!end || end.length !== 3 || start.length !== end.length || start.some(function (val, i) {
    return val !== end[i];
  })) {
    if (end) {
      icsFormat += (0, _utils.foldLine)("DTEND".concat(end.length === 3 ? ";VALUE=DATE" : "", ":").concat((0, _encodeNewLines["default"])((0, _utils.formatDate)(end, endOutputType || startOutputType || startType, endInputType || startInputType)))) + '\r\n';
    }
  }
  icsFormat += typeof sequence !== 'undefined' ? "SEQUENCE:".concat(sequence, "\r\n") : '';
  icsFormat += description ? (0, _utils.foldLine)("DESCRIPTION:".concat((0, _encodeNewLines["default"])((0, _utils.setDescription)(description)))) + '\r\n' : '';
  icsFormat += url ? (0, _utils.foldLine)("URL:".concat((0, _encodeNewLines["default"])(url))) + '\r\n' : '';
  icsFormat += geo ? (0, _utils.foldLine)("GEO:".concat((0, _utils.setGeolocation)(geo))) + '\r\n' : '';
  icsFormat += location ? (0, _utils.foldLine)("LOCATION:".concat((0, _encodeNewLines["default"])((0, _utils.setLocation)(location)))) + '\r\n' : '';
  icsFormat += status ? (0, _utils.foldLine)("STATUS:".concat((0, _encodeNewLines["default"])(status))) + '\r\n' : '';
  icsFormat += categories ? (0, _utils.foldLine)("CATEGORIES:".concat((0, _encodeNewLines["default"])(categories.join(',')))) + '\r\n' : '';
  icsFormat += organizer ? (0, _utils.foldLine)("ORGANIZER;".concat((0, _utils.setOrganizer)(organizer))) + '\r\n' : '';
  icsFormat += busyStatus ? (0, _utils.foldLine)("X-MICROSOFT-CDO-BUSYSTATUS:".concat((0, _encodeNewLines["default"])(busyStatus))) + '\r\n' : '';
  icsFormat += transp ? (0, _utils.foldLine)("TRANSP:".concat((0, _encodeNewLines["default"])(transp))) + '\r\n' : '';
  icsFormat += classification ? (0, _utils.foldLine)("CLASS:".concat((0, _encodeNewLines["default"])(classification))) + '\r\n' : '';
  icsFormat += created ? 'CREATED:' + (0, _encodeNewLines["default"])((0, _utils.formatDate)(created)) + '\r\n' : '';
  icsFormat += lastModified ? 'LAST-MODIFIED:' + (0, _encodeNewLines["default"])((0, _utils.formatDate)(lastModified)) + '\r\n' : '';
  icsFormat += htmlContent ? (0, _utils.foldLine)("X-ALT-DESC;FMTTYPE=text/html:".concat((0, _encodeNewLines["default"])(htmlContent))) + '\r\n' : '';
  if (attendees) {
    attendees.forEach(function (attendee) {
      icsFormat += (0, _utils.foldLine)("ATTENDEE;".concat((0, _encodeNewLines["default"])((0, _utils.setContact)(attendee)))) + '\r\n';
    });
  }
  icsFormat += recurrenceRule ? (0, _utils.foldLine)("RRULE:".concat((0, _encodeNewLines["default"])(recurrenceRule))) + '\r\n' : '';
  icsFormat += exclusionDates ? (0, _utils.foldLine)("EXDATE:".concat((0, _encodeNewLines["default"])(exclusionDates.map(function (a) {
    return (0, _utils.formatDate)(a);
  }).join(',')))) + '\r\n' : '';
  icsFormat += duration ? (0, _utils.foldLine)("DURATION:".concat((0, _utils.formatDuration)(duration))) + '\r\n' : '';
  if (alarms) {
    alarms.forEach(function (alarm) {
      icsFormat += (0, _utils.setAlarm)(alarm);
    });
  }
  icsFormat += "END:VEVENT\r\n";
  return icsFormat;
}