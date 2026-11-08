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
- `npm run test` (Vitest), `npm run test:e2e` (Playwright on ports 3102/4102, `e2e/mock-backend.mjs` stands in for the server and Keycloak)
- `npm run gql-codegen` — regenerate `src/gql/` from a sibling `fgv-spexify-server` checkout. Commit the result.

**Don't run `npm run format`**: `.prettierrc` uses 2 spaces and the code base 4.

## Conventions

- `"use client"` ⇔ `*.client.ts(x)`; `import "server-only"` and `"use server"` ⇔ `*.server.ts`. Exceptions:
  `src/auth.ts`, Next.js reserved file names, and shadcn's `src/components/ui/**` and `src/hooks/use-mobile.ts`.
- Cache Components is on. A page that fetches at the top needs a `loading.tsx`, and `(app)/layout.tsx` keeps
  `export const instant = false`. The root layout's metadata stays static.
- Cache Components keeps visited pages alive, so a client component that copies a server prop into state (an
  optimistic toggle or rating) uses `useServerState` (`src/hooks/use-server-state.client.ts`), never `useState(prop)`,
  which would show the old value when the page is shown again.
- Locale is a cookie (`sv` default); messages in `messages/{sv,en}.json`.
- Auth: Better Auth + Keycloak, stateless. `getSessionContext()` in `src/utils/auth.server.ts` is the single entry
  point; roles come from `resource_access["fgv-spexify"].roles`: `USER` (access), `EDITOR`, `ADMIN`. Gate pages with
  `withPolicyPage(Policies.<area>.require…)`; `Policies` are `app.requireAccess`, `editor.requireEditor`,
  `admin.requireAdmin`. The server enforces every rule anyway.
- No `NEXT_PUBLIC_*` variables: read config on the server at request time and pass it as props.

## How Spexify works in the web

- **Audio** plays through one `<audio>` element in `PlayerProvider` (`src/components/player/`), which lives in the
  `(app)` layout so playing continues across pages. Its source is `/api/audio/[id]`, a route handler that asks the
  server for a signed, expiring link (`/api/tracks/{id}/audio/link`) with the user's token and redirects to it; the
  downloads do the same. The link is on the API's public address (`MEDIA_ORIGIN`, allowed in the per-request CSP in
  `proxy.ts`), so audio never passes through the web or the CDN in front of it. Never give the browser the token, and
  never stream audio or downloads through the web again. There are two such elements: one plays while the other loads the next track, three seconds into the current
  one, so the next starts at once (nearly gapless; HTML audio leaves a few milliseconds between files). Volume, mute and
  the ReplayGain mode (off, track, album; `gainFactor` only turns down) are kept in `localStorage` (`spexify.player`).
  The queue can be reordered, pruned and cleared. The Media Session API gives lock screen controls. Plays are reported
  to Navidrome (`scrobbleAction`), and counted at once in the track lists (`player.plays`) until Navidrome's own numbers
  include them (`playedSince`).
- **Keyboard shortcuts** (`src/components/player/shortcuts.client.tsx`) work anywhere except where the focused element
  uses the key; `?` lists them.
- **Radio** (`useRadio`, `radioAction`) plays `radio(trackId | albumId)`: tracks that share the melody, original artist,
  performers, authors or spex, or random tracks without a seed (the start page's button, top right). The album page
  calls it "Spela liknande", since it plays other albums too.
- **The two audio elements** are both listened to all the time and only the playing one counts (`listen` in
  `PlayerProvider`): the next track starts in the other element before React renders again, so a listener attached
  only to the active element misses its `play` event and its `durationchange`.
- **Collections** (`/collections`, edited under `/manage/collections`, deleted by ADMIN) hold albums in an order of
  their own, like Spexflix's collections of videos; the album page links to the ones it is in.
- **Song lists from many albums** (`TrackList` with `showAlbum`: liked, playlists, search, credits, the top list) show
  the album's cover instead of the track number, which only means something on the album page; `ranked` numbers the
  rows and `stats` (by track id) shows what a top list ranks by. A track's "…" menu lists five playlists, most
  recently changed first, and offers the rest through `useDialogs().choose`, which can be searched.
- **Credits** (`/credits/[kind]/[name]`) list the tracks of a performer, melody, original artist (the parentheses after
  the melody), lyricist or arranger; `splitCredits` splits names the way the server does.
- **Covers** come from `/api/cover/[id]` (the album's cover, else the spex poster, else 404 and `CoverImage`'s
  placeholder). Never `next/image`, whose optimizer has no session.
- **Downloads**: `/api/download/track/[id]` and `/api/download/album/[id]` (a zip streamed by the server).
- **Uploads** use tus through `/api/uploads/[[...path]]`, which forwards to the server with the token; `uploadFile` in
  `src/components/upload/tus.client.ts` resolves with the upload id, which `trackCreate` or `trackReplaceAudio` turns
  into a track. Chunks are 50 MB, below Cloudflare's request limit, and `proxyClientMaxBodySize` is 55 MB.
- **Likes (stars), ratings, playlists, plays and the play queue** live in Navidrome per user and are reached through the server's Subsonic gateway
  (`src/lib/subsonic.server.ts`) with the user's token. They work only for published tracks, which have a
  `navidromeId`; `tracksByNavidromeIds` and `albumsByNavidromeIds` map Navidrome's songs and albums back. Play counts
  and when last played come from `getAlbum`, `getStarred2` and `getPlaylist` (`toRows(tracks, plays)`); the start
  page's "recently played", "most played" and "highest rated" rows from `getAlbumList2` (`getPlayedAlbums`). Songs and
  albums are starred and rated (`setRating`, 1–5, 0 removes) with their Navidrome ids. The UI calls a star a like
  ("Gilla", a heart, the page "Gillat" at `/starred`) so that stars only mean ratings. Playlists are renamed, described,
  made public (`updatePlaylist`) and reordered (`createPlaylist` with the playlist's id); others' public playlists are
  `readonly` and only played. All of it falls back to nothing when Navidrome is unavailable.
- **Everyone's ratings, likes and plays**: Navidrome keeps them per user, so the server mirrors what passes through its
  gateway (and copies Navidrome's state nightly, `LISTENING_SYNC`). `Track`/`Album` carry `averageRating`,
  `ratingCount`, `likeCount` and `totalPlays`; `AverageRating` (`src/components/rating.client.tsx`) shows them as a
  star and the average. A track row has the user's own stars (`RatingInput`) beside everyone's average; the "…" menu
  rates only on phones. Show ratings as stars, never as text. `/top` (Topplistan) lists `topTracks`/`topAlbums` by
  `RATED` (weighted average), `LIKED` or `PLAYED`, per category and decade; rows whose own rating is not known
  (`rating: undefined`) show the average alone. What it ranks by is underlined tabs (`LinkTabs`), songs or albums a
  switch (`LinkSegments`, `src/components/link-tabs.tsx`, the same file as Spexflix's), and categories and decades
  chips. `/albums` takes `category`, `decade` (e.g. 1970) or `year`, `liked=1`
  and `sort` (`SortSelect`).
- **The start page** has the same order as Spexflix's: greeting, browsing (categories, the top list, decades), what
  the user played, the top list, recently published, what they like, then their most played and highest rated
  (`HomeSection`). Texts that can be long wrap with `text-pretty` up to `max-w-4xl`, not `max-w-prose`.
- **The play queue** is shared with the user's apps through `savePlayQueue`/`getPlayQueue`: `PlayerProvider` saves it
  when it changes, on pause and every 30 s while playing, and an empty player takes it up again, paused, on the first
  page load. It saves nothing before the saved queue was read.
- **Spex**: an album is about a list of spex, the main one first (poster, category, default title and year), or none,
  which the editor marks explicitly (`SpexPicker` in `src/components/spex/`). Each spex has a `familyId`, its original's
  id for a revival; `/albums?spex=<familyId>` and the album page's "more from the same spex" list an original with its
  revivals, and `spexSearch` returns revivals right after their original, which the picker indents.
- **Album kinds** are configured by admins (`/admin/kinds`) and come from `albumKinds`; show them with
  `kindName(kind, locale)`. The first kind is the default and is not shown as a badge (`kind.isDefault`).
- **The player bar** sets `--player-height` on `<html>` while it shows; the page and the sidebar (with the account
  menu and logout at its bottom) end above it.
- **Dialogs**: never `window.confirm`, `window.prompt` or `window.alert`. Ask with `useDialogs()` (`confirm` and
  `prompt`, from `DialogsProvider` in `src/components/dialogs.client.tsx`, which the `(app)` layout mounts). The e2e
  fixture `noNativeDialogs` fails any test that opens a native dialog; answer the app's own with `answerDialog`.
- **App passwords and API keys** (`/apps`) are shown once, right after they are created.
- **The change log** (`ChangeLog` in `src/components/audit/change-log.tsx`) filters by kind, event, person (ADMIN),
  period and text through the address, links each change to its record, and `RecordHistory` shows an album's latest
  changes on its edit page. Record kinds and their pages are in `src/app/(app)/manage/audit/links.ts`.
- **Editors** work under `/manage` (albums, the trash, the change log), **admins** under `/admin` (the music server,
  users, settings). New albums start unpublished; publishing an album or a track puts it into Navidrome.
- **Links to Spexflix** (`Track.videoLinks`) are shown only when `me.spexflixUser` and `SPEXFLIX_WEB_URL` are set.

## Look

The look is FGV's, the same as Spexregister's and Nyuppsättning's: `Logo`, `LogoText` and `LogoHome` in
`src/components/`, `src/app/favicon.ico`, and the colours in `src/app/globals.css`. Don't give the application a logo
or colours of its own. `src/app/icon.svg` (the FGV logo) is only for the installable app's manifest.

## Consent and visitor statistics

The cookie banner is c15t (`src/components/consent-manager.client.tsx`) in offline mode with only the `necessary`
category, as in `fgv-revival-web`: the application sets only strictly necessary cookies, and Umami sets none.

Umami, self-hosted in `fgv-infra-deploy`, is reached server-side at `UMAMI_URL`. Browsers never talk to it:
`src/app/stats/` serves the tracker as `/stats/script.js` and forwards `/stats/api/send` with the browser's IP and
user agent. `src/components/umami.tsx` renders nothing unless `UMAMI_URL` and `UMAMI_WEBSITE_ID` are both set, and
drops query strings.

Custom events go through `track()` (`src/utils/umami.ts`; import it as `trackEvent` where `track` is a variable), a
no-op when the tracker isn't loaded. Event data is enum values, counts and booleans only — never names, emails, ids or
typed text. Events: `album-create` (`defaultKind`), `track-upload`, `album-publish` (`published`), `track-star` (`starred`), `track-rate` (`rating`), `album-star` (`starred`), `album-rate` (`rating`), `playlist-add`
(`created`), `radio-start` (`seed`), `collection-create` (`albums`), `app-password-create`, `api-key-create`, `language-change` and `theme-change`, and through
`data-umami-event` on the links `track-download` and `album-download`.

## Application switcher

The title in the header (`src/components/app-switcher.client.tsx`) opens a menu of the FGV applications: Spexregister,
Nyuppsättning, Spexflix, Spexify, Spexgram and Spexarkiv. `getApplications()` (`src/utils/applications.server.ts`) lists the current one and
each other one whose `USER` role is in the access token and whose address is set (`SPEXREGISTER_WEB_URL`,
`FGV_REVIVAL_WEB_URL`, `SPEXFLIX_WEB_URL`, `SPEXIFY_WEB_URL`, `SPEXGRAM_WEB_URL`,
`ARCHIVE_WEB_URL`). The role is there because fgv-keycloak maps every web
client to the other web clients' `USER` role; a realm imported before that needs fgv-infra-deploy's
`bin/configure-keycloak.sh`. With no other application to offer, the title is plain text. The six webs (with fgv-spexgram-web and
fgv-archive-web) carry identical copies of `applications.ts`, the component and their tests, and differ only in the id passed in
`applications.server.ts`, so change all six together.

## Testing

- E2E specs per area (listening/watching, editing, uploads, trash and change log, admin, errors, language). The mock
  backend keeps state per test (reset automatically) and implements tus; the `mock` fixture switches it: `spexregister(up)`, `navidrome(up)`, `plays({navidromeId: {playCount, played}})`, `playQueue(queue)`, `failNext(operation, classification)` and `state()`.
  `state()` lets a spec check what the web sent.
- Call `hydrated(page, selector)` before `setInputFiles`: a file chosen before React hydrates the input is lost.
- Unit tests in `__tests__/` beside the code. E2E specs in `e2e/`, one per area, with personas `admin`, `editor`,
  `listener` and `noaccess` in the mock backend. All test data is fictitious.
- Cache Components keeps visited routes mounted but hidden, so prefer role queries, and use `{exact: true}` for labels
  that are part of others (e.g. "Namn" in "Användarnamn").
