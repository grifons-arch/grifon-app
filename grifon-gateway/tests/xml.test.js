"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const xml_1 = require("../src/utils/xml");
(0, vitest_1.describe)("parseXmlToJson", () => {
    (0, vitest_1.it)("parses prestashop xml payload", () => {
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <prestashop>
        <categories>
          <category>
            <id>1</id>
            <name>Root</name>
          </category>
        </categories>
      </prestashop>`;
        const result = (0, xml_1.parseXmlToJson)(xml);
        (0, vitest_1.expect)(result.prestashop.categories.category.id).toBe("1");
        (0, vitest_1.expect)(result.prestashop.categories.category.name).toBe("Root");
    });
});
