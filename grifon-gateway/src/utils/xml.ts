import { XMLBuilder, XMLParser } from "fast-xml-parser";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  textNodeName: "text",
  allowBooleanAttributes: true
});

const builder = new XMLBuilder({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  textNodeName: "text"
});

export const parseXmlToJson = (xml: string): unknown => {
  return parser.parse(xml);
};

export const buildXmlFromJson = (payload: unknown): string => {
  return builder.build(payload);
};
