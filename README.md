# Spexify Web

## Overview

Spexify Web is the frontend of Spexify, FGV's music service for the songs the spex have recorded over the years.
Listeners browse, search and play albums, star tracks, keep playlists and create app passwords for Subsonic apps.
Editors upload songs and keep their metadata; admins see the music server, users and settings. It talks to
[Spexify Server][1] over GraphQL and plain HTTP. The product spec is in [fgv-spexify-spec][2].

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Cache Components)
- **UI & Styling:** [shadcn/ui](https://ui.shadcn.com/), [Base UI](https://base-ui.com/) &
  [Tailwind CSS 4](https://tailwindcss.com/)
- **Data Fetching:** [urql](https://formidable.com/open-source/urql/) (GraphQL) with GraphQL Code Generator
- **Uploads:** [tus-js-client](https://github.com/tus/tus-js-client), resumable, in chunks of at most 50 MB
- **Authentication:** [Better Auth](https://better-auth.com/) (Keycloak, stateless sessions)
- **Internationalization:** [next-intl](https://next-intl-docs.vercel.app/) (Swedish and English)

## Getting Started

Node.js 26 (see `.nvmrc`) and a running Spexify Server, Keycloak from `fgv-infra-deploy/local`, and the `fgv-spexify`
client in the realm.

```bash
npm install
cp .env.local.example .env.local   # set KEYCLOAK_CLIENT_SECRET and AUTH_SECRET
npm run dev                        # http://localhost:3002
```

| Variable                         | Purpose                                                                   |
|----------------------------------|---------------------------------------------------------------------------|
| `BETTER_AUTH_URL`                | The web's public address                                                  |
| `AUTH_SECRET`                    | Encrypts the session cookies; at least 32 random characters               |
| `KEYCLOAK_ISSUER`                | The realm, e.g. `https://auth.example.org/auth/realms/fgv`                |
| `KEYCLOAK_CLIENT_ID`, `_SECRET`  | The `fgv-spexify` client                                                  |
| `API_GRAPHQL_ENDPOINT`           | Spexify Server's GraphQL endpoint; its other endpoints share the origin   |
| `SUBSONIC_URL`                   | The address Subsonic apps connect to, shown on *My apps*; defaults to `BETTER_AUTH_URL` |
| `SPEXFLIX_WEB_URL`               | Spexflix, for *Watch in Spexflix* links; without it there are none        |
| `SPEXREGISTER_WEB_URL`           | Spexregister, for links to a spex                                         |
| `SUPPORTED_LOCALES`, `DEFAULT_LOCALE` | `sv,en` and `sv`                                                    |
| `SUPPORT_EMAIL`, `FEEDBACK_EMAIL` | Addresses on the Support and About pages                                 |
| `UMAMI_URL`, `UMAMI_WEBSITE_ID`  | Visitor statistics; without them nothing is sent                          |

## Commands

| Command                 | What it does                                                                       |
|-------------------------|------------------------------------------------------------------------------------|
| `npm run dev`           | Development server on port 3002                                                    |
| `npm run build` / `start` | Production build and server                                                      |
| `npm run lint`, `typecheck` | ESLint and TypeScript                                                          |
| `npm run test`          | Unit tests (Vitest)                                                                |
| `npm run test:e2e`      | E2E tests (Playwright) against `e2e/mock-backend.mjs`, which also acts as Keycloak |
| `npm run gql-codegen`   | Regenerates `src/gql/` from a sibling `fgv-spexify-server` checkout; commit the result |

## Branding

Spexify's mark is `src/components/brand/spexify-mark.tsx` and `src/app/icon.svg`; its colours are the `--brand`
tokens at the top of `src/app/globals.css`, which also drive `--primary`. Replace those to change the look.

## Docker

The `Dockerfile` builds a standalone image, published by CI as `bloomper/fgv-spexify-web`. `fgv-spexify-deploy` runs
it.

[1]: https://github.com/bloomper/fgv-spexify-server
[2]: https://github.com/bloomper/fgv-spexify-spec
