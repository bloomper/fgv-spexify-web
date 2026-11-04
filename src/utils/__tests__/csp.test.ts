import { describe, expect, it } from "vitest";
import { contentSecurityPolicy } from "@/utils/csp";

describe("contentSecurityPolicy", () => {
  it("allows the media origin for audio only", () => {
    const policy = contentSecurityPolicy("https://api.example.org", false);

    expect(policy).toContain("media-src 'self' blob: https://api.example.org");
    expect(policy).toContain("connect-src 'self';");
    expect(policy).not.toContain("unsafe-eval");
  });

  it("ignores an origin that is not one", () => {
    expect(contentSecurityPolicy("https://x.org; script-src *", false)).toContain("media-src 'self' blob:;");
    expect(contentSecurityPolicy(undefined, true)).toContain("'unsafe-eval'");
  });
});
