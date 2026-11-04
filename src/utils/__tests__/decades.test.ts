import { describe, expect, it } from "vitest";
import { decadesOf, parseDecade } from "@/utils/decades";

describe("decades", () => {
  it("groups years into decades, newest first", () => {
    expect(decadesOf([1975, 1979, 2026, 1948, 1970])).toEqual([2020, 1970, 1940]);
  });

  it("reads only whole decades", () => {
    expect(parseDecade("1970")).toBe(1970);
    expect(parseDecade("1975")).toBeNull();
    expect(parseDecade("abc")).toBeNull();
    expect(parseDecade(undefined)).toBeNull();
  });
});
