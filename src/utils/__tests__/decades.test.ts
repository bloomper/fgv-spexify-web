import { describe, expect, it } from "vitest";
import { byDecade, byKind, decadesOf, parseDecade } from "@/utils/decades";

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

  it("groups albums by decade, newest first, leaving out those without a year", () => {
    const albums = [
      { id: "a", year: 1975 },
      { id: "b", year: 2024 },
      { id: "c", year: null },
      { id: "d", year: 1979 },
    ];

    expect(byDecade(albums)).toEqual([
      { decade: 2020, albums: [albums[1]] },
      { decade: 1970, albums: [albums[0], albums[3]] },
    ]);
  });

  it("groups albums by the kinds that are not the default, in the kinds' order", () => {
    const kinds = [
      { id: "show", isDefault: true },
      { id: "cd", isDefault: false },
      { id: "lp", isDefault: false },
      { id: "empty", isDefault: false },
    ];
    const albums = [
      { id: "a", kind: { id: "lp" } },
      { id: "b", kind: { id: "show" } },
      { id: "c", kind: { id: "cd" } },
    ];

    expect(byKind(albums, kinds)).toEqual([
      { kind: kinds[1], albums: [albums[2]] },
      { kind: kinds[2], albums: [albums[0]] },
    ]);
  });
});
