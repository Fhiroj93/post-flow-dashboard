import { describe, it, expect } from "vitest";
import { parseResponse } from "./useGoogleSheets";

const sample = `google.visualization.Query.setResponse({"table":{"cols":[{"label":"Title"},{"label":"Status"}],"rows":[{"c":[{"v":"Test Post"},{"v":"Posted"}]}]}});`;

describe("parseResponse", () => {
  it("parses a gviz response into row objects", () => {
    const rows = parseResponse(sample);
    expect(rows).toEqual([{ Title: "Test Post", Status: "Posted" }]);
  });

  it("returns an empty array for malformed input", () => {
    expect(parseResponse("not valid")).toEqual([]);
  });
});