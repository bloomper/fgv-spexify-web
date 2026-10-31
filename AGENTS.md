<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Spexify Web — project notes

Next.js 16 App Router + React 19 frontend for Spexify, FGV's music service. It is backed by `fgv-spexify-server`'s
GraphQL API, its plain HTTP endpoints for audio, downloads, covers and tus uploads, and its Subsonic gateway for what
lives in Navidrome per user (stars, playlists, play counts). Stack and setup: `README.md`. Product spec:
`fgv-spexify-spec`. The scaffolding (auth, layout, i18n, shadcn, CI) comes from `fgv-revival-web`; keep the two alike.

## Commands

- `npm run dev` (port 3002) / `build` / `start`
- `npm run lint`, `npm run typecheck` (covers `src/**` only)
- `npm run test` (Vitest), `npm run test:e2e` (Playwright, `e2e/mock-backend.mjs` stands in for the server and Keycloak)
- `npm run gql-codegen` — regenerate `src/gql/` from a sibling `fgv-spexify-server` checkout. Commit the result.

**Don't run `npm run format`**: `.prettierrc` uses 2 spaces and the code base 4.

## Conventions

- `"use client"` ⇔ `*.client.ts(x)`; `import "server-only"` and `"use server"` ⇔ `*.server.ts`. Exceptions:
  `src/auth.ts`, Next.js reserved file names, and shadcn's `src/components/ui/**` and `src/hooks/use-mobile.ts`.
- Cache Components is on. A page that fetches at the top needs a `loading.tsx`, and `(app)/layout.tsx` keeps
  `export const instant = false`. The root layout's metadata stays static.
- Locale is a cookie (`sv` default); messages in `messages/{sv,en}.json`.
- Auth: Better Auth + Keycloak, stateless. `getSessionContext()` in `src/utils/auth.server.ts` is the single entry
  point; roles come from `resource_access["fgv-spexify"].roles`: `USER` (access), `EDITOR`, `ADMIN`. Gate pages with
  `withPolicyPage(Policies.<area>.require…)`; `Policies` are `app.requireAccess`, `editor.requireEditor`,
  `admin.requireAdmin`. The server enforces every rule anyway.
- No `NEXT_PUBLIC_*` variables: read config on the server at request time and pass it as props.

## How Spexify works in the web

- **Audio** plays through one `<audio>` element in `PlayerProvider` (`src/components/player/`), which lives in the
  `(app)` layout so playing continues across pages. Its source is `/api/audio/[id]`, a route handler that streams the
  server's `/api/tracks/{id}/audio` with the user's token and passes byte ranges both ways. Never give the browser the
  token. The Media Session API gives lock screen controls. Plays are reported to Navidrome (`scrobbleAction`).
- **Covers** come from `/api/cover/[id]` (the album's cover, else the spex poster, else 404 and `CoverImage`'s
  placeholder). Never `next/image`, whose optimizer has no session.
- **Downloads**: `/api/download/track/[id]` and `/api/download/album/[id]` (a zip streamed by the server).
- **Uploads** use tus through `/api/uploads/[[...path]]`, which forwards to the server with the token; `uploadFile` in
  `src/components/upload/tus.client.ts` resolves with the upload id, which `trackCreate` or `trackReplaceAudio` turns
  into a track. Chunks are 50 MB, below Cloudflare's request limit, and `proxyClientMaxBodySize` is 55 MB.
- **Stars and playlists** live in Navidrome per user and are reached through the server's Subsonic gateway
  (`src/lib/subsonic.server.ts`) with the user's token. They work only for published tracks, which have a
  `navidromeId`; `tracksByNavidromeIds` maps Navidrome's songs back to tracks.
- **App passwords and API keys** (`/apps`) are shown once, right after they are created.
- **Editors** work under `/manage` (albums, the trash, the change log), **admins** under `/admin` (the music server,
  users, settings). New albums start unpublished; publishing an album or a track puts it into Navidrome.
- **Links to Spexflix** (`Track.videoLinks`) are shown only when `me.spexflixUser` and `SPEXFLIX_WEB_URL` are set.

## Testing

- Unit tests in `__tests__/` beside the code. E2E specs in `e2e/`, one per area, with personas `admin`, `editor`,
  `listener` and `noaccess` in the mock backend. All test data is fictitious.
- Cache Components keeps visited routes mounted but hidden, so prefer role queries, and use `{exact: true}` for labels
  that are part of others (e.g. "Namn" in "Användarnamn").
