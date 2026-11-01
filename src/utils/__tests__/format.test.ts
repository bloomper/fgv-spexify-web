import {describe, expect, it} from "vitest";
import {formatInstant} from "@/utils/format";

describe("format", () => {
    it("formats instants as yyyy-mm-dd hh:mm in Swedish time", () => {
        expect(formatInstant("2028-02-10T12:00:00Z")).toBe("2028-02-10 13:00");
        expect(formatInstant("2028-07-01T22:30:00Z")).toBe("2028-07-02 00:30");
        expect(formatInstant(undefined)).toBeNull();
        expect(formatInstant("garbage")).toBe("garbage");
    });
});
