"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.convertTimestampToArray = convertTimestampToArray;
exports.createEvent = createEvent;
exports.createEvents = createEvents;
exports.isValidURL = isValidURL;
var _pipeline = require("./pipeline");
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function buildHeaderAndValidate(header) {
  return (0, _pipeline.validateHeader)((0, _pipeline.buildHeader)(header));
}
function buildHeaderAndEventAndValidate(event) {
  return (0, _pipeline.validateHeaderAndEvent)(_objectSpread(_objectSpread({}, (0, _pipeline.buildHeader)(event)), (0, _pipeline.buildEvent)(event)));
}
function convertTimestampToArray(timestamp) {
  var inputType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'local';
  var dateArray = [];
  var d = new Date(timestamp);
  dateArray.push(inputType === 'local' ? d.getFullYear() : d.getUTCFullYear());
  dateArray.push((inputType === 'local' ? d.getMonth() : d.getUTCMonth()) + 1);
  dateArray.push(inputType === 'local' ? d.getDate() : d.getUTCDate());
  dateArray.push(inputType === 'local' ? d.getHours() : d.getUTCHours());
  dateArray.push(inputType === 'local' ? d.getMinutes() : d.getUTCMinutes());
  return dateArray;
}
function createEvent(attributes, cb) {
  return createEvents([attributes], cb);
}
function createEvents(events, headerAttributesOrCb, cb) {
  var resolvedHeaderAttributes = _typeof(headerAttributesOrCb) === 'object' ? headerAttributesOrCb : {};
  var resolvedCb = arguments.length === 3 ? cb : typeof headerAttributesOrCb === 'function' ? headerAttributesOrCb : null;
  var run = function run() {
    if (!events) {
      return {
        error: new Error('one argument is required'),
        value: null
      };
    }
    var _ref = events.length === 0 ? buildHeaderAndValidate(resolvedHeaderAttributes) : buildHeaderAndEventAndValidate(_objectSpread(_objectSpread({}, events[0]), resolvedHeaderAttributes)),
      headerError = _ref.error,
      headerValue = _ref.value;
    if (headerError) {
      return {
        error: headerError,
        value: null
      };
    }
    var value = '';
    value += (0, _pipeline.formatHeader)(headerValue);
    for (var i = 0; i < events.length; i++) {
      var _buildHeaderAndEventA = buildHeaderAndEventAndValidate(events[i]),
        eventError = _buildHeaderAndEventA.error,
        eventValue = _buildHeaderAndEventA.value;
      if (eventError) return {
        error: eventError,
        value: null
      };
      value += (0, _pipeline.formatEvent)(eventValue);
    }
    value += (0, _pipeline.formatFooter)();
    return {
      error: null,
      value: value
    };
  };
  var returnValue;
  try {
    returnValue = run();
  } catch (e) {
    returnValue = {
      error: e,
      value: null
    };
  }
  if (!resolvedCb) {
    return returnValue;
  }
  return resolvedCb(returnValue.error, returnValue.value);
}
function isValidURL(url) {
  return _pipeline.urlRegex.test(url);
}