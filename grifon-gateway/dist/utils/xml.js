"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildXmlFromJson = exports.parseXmlToJson = void 0;
const fast_xml_parser_1 = require("fast-xml-parser");
const parser = new fast_xml_parser_1.XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    textNodeName: "text",
    allowBooleanAttributes: true
});
const builder = new fast_xml_parser_1.XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: ""
});
const parseXmlToJson = (xml) => {
    return parser.parse(xml);
};
exports.parseXmlToJson = parseXmlToJson;
const buildXmlFromJson = (payload) => {
    return builder.build(payload);
};
exports.buildXmlFromJson = buildXmlFromJson;
