/**
 * The pages' Content Security Policy. The player's audio comes from signed links on the API's public address, which
 * differs per environment, so the policy is built at request time (in {@code proxy.ts}) from {@code MEDIA_ORIGIN}
 * rather than fixed at build time in next.config.ts.
 */
export function contentSecurityPolicy(mediaOrigin: string | undefined, development: boolean): string {
    const media = mediaOrigin && /^https?:\/\/[A-Za-z0-9.-]+(:\d+)?$/.test(mediaOrigin) ? ` ${mediaOrigin}` : "";

    return [
        "default-src 'self'",
        `script-src 'self' 'unsafe-inline'${development ? " 'unsafe-eval'" : ""}`,
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' blob: data: https:",
        `media-src 'self' blob:${media}`,
        "font-src 'self'",
        "connect-src 'self'",
        "worker-src 'self' blob:",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
    ].join("; ");
}
