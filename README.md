# Spexify Web

## Overview

Spexify Web is the frontend of Spexify, FGV's music service for the songs the spex have recorded over the years.
Listeners browse, search and play albums, star tracks, keep playlists and create app passwords for Subsonic apps.
Editors upload songs and keep their metadata; admins see the music server, users and settings. It talks to
[Spexify Server][1] over GraphQL and plain HTTP. The product spec is in [fgv-spexify-spec][2].

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **UI & Styling:** [shadcn/ui](https://ui.shadcn.com/), [Base UI](https://base-ui.com/) &
  [Tailwind CSS 4](https://tailwindcss.com/)
- **Data Fetching:** [urql](https://formidable.com/open-source/urql/) (GraphQL) with GraphQL Code Generator
- **Authentication:** [Better Auth](https://better-auth.com/) (Keycloak integration, stateless sessions)
- **Internationalization:** [next-intl](https://next-intl-docs.vercel.app/) (Supports Swedish & English)
- **Uploads:** [tus-js-client](https://github.com/tus/tus-js-client), resumable, in chunks of at most 50 MB

The look (logo, favicon and colours) is FGV's, shared with Spexregister and Nyuppsättning.

## Getting Started

### Prerequisites

- Node.js 26 (see `.nvmrc`)
- npm (package manager)
- Docker & Docker Compose (optional, for containerized setup)

### Development

1. **Install dependencies:**
   ```bash
   npm ci
   ```

2. **Configure environment:**
   Start fgv-infra-deploy's local stack and [Spexify Server][1]'s (its getting started guide describes both), then
   create `.env.local` (`.env` already holds the rest):
   ```
   BETTER_AUTH_URL=http://localhost:3002
   AUTH_SECRET=<random string of at least 32 characters>
   KEYCLOAK_CLIENT_ID=fgv-spexify
   KEYCLOAK_CLIENT_SECRET=<secret of the fgv-spexify client>
   KEYCLOAK_ISSUER=https://auth.fgv.local.nu:8443/auth/realms/fgv
   API_GRAPHQL_ENDPOINT=https://api.spexify.fgv.local.nu:8443/api/graphql
   SUBSONIC_URL=https://api.spexify.fgv.local.nu:8443
   MEDIA_ORIGIN=https://api.spexify.fgv.local.nu:8443
   SPEXFLIX_WEB_URL=http://localhost:3003
   SPEXREGISTER_WEB_URL=http://localhost:3000
   FGV_REVIVAL_WEB_URL=http://localhost:3001
   SPEXGRAM_WEB_URL=http://localhost:3004
   ARCHIVE_WEB_URL=http://localhost:3005
   ```
   The client secret is in `realm/fgv.json` in [fgv-keycloak][7]; search for `fgv-spexify`.
   For visitor statistics, run fgv-infra-deploy's `local/bin/configure-umami.sh` and put the ID it prints for Spexify
   in `.env.local` as `UMAMI_WEBSITE_ID`, with `UMAMI_URL=https://analytics.fgv.local.nu:8443`.
   `npm run dev` and `docker compose` trust the root certificate of fgv-infra-deploy's local Caddy
   (`local/.docker/caddy/data/caddy/pki/authorities/local/root.crt`), read from `../fgv-infra-deploy`, or from
   `INFRA_DEPLOY` if it is checked out elsewhere.

   | Variable                         | Purpose                                                                   |
   |----------------------------------|---------------------------------------------------------------------------|
   | `API_GRAPHQL_ENDPOINT`           | Spexify Server's GraphQL endpoint; its other endpoints share the origin     |
   | `SUBSONIC_URL`                   | The address Subsonic apps connect to, shown on *My apps*; defaults to `BETTER_AUTH_URL` |
   | `MEDIA_ORIGIN`                   | The API's public origin, allowed in the pages' Content Security Policy: the player and downloads are redirected to signed links there |
   | `SPEXFLIX_WEB_URL`               | Spexflix, for *Watch in Spexflix* links; without it there are none; also the application switcher |
   | `SPEXREGISTER_WEB_URL`           | Spexregister, for links to a spex; also the application switcher          |
   | `FGV_REVIVAL_WEB_URL`            | Nyuppsättning, for the application switcher in the header                 |
   | `SPEXGRAM_WEB_URL`               | Spexgram, for the application switcher                                    |
   | `ARCHIVE_WEB_URL`                | Spexarkiv, for the application switcher                                 |

3. **Generate GraphQL types:**
   If you change GraphQL queries or the schema, regenerate types from a sibling `fgv-spexify-server` checkout:
   ```bash
   npm run gql-codegen
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3002](http://localhost:3002) with your browser to see the result. Port 3002 keeps it
   clear of the other FGV webs (Spexregister on 3000, Nyuppsättning on 3001, Spexify on 3002, Spexflix on 3003).

## Docker

The project includes a `Dockerfile` and `docker-compose.yaml` for containerized deployment, including a Caddy reverse
proxy setup for local development with HTTPS.

### Running with Docker Compose

To start the application along with the Caddy reverse proxy:

```bash
docker compose up --build
```

The application will be accessible at `https://spexify.fgv.local.nu:9443` if your hosts file is configured. It talks to
the server's API at `api.spexify.fgv.local.nu:8443` and to Keycloak at `auth.fgv.local.nu:8443`, both behind
fgv-infra-deploy's local Caddy. To log in, `SPEXIFY_URL` in fgv-infra-deploy's `local/.env` must be
`https://spexify.fgv.local.nu:9443`, since the realm only accepts redirects to that address.

### Published images

CI publishes `bloomper/fgv-spexify-web` for `linux/amd64`:

| Trigger              | Tags                              |
|----------------------|-----------------------------------|
| push to `develop`    | `develop`, `sha-<commit>`         |
| push of tag `vX.Y.Z` | `X.Y.Z`, `latest`, `sha-<commit>` |

To release, set `version` in `package.json` to `X.Y.Z`, merge to `main`, then
`git tag vX.Y.Z && git push origin vX.Y.Z`. The publish fails if the tag doesn't match the version or if `X.Y.Z` is
already on Docker Hub.

The image contains no environment-specific values. All configuration is read at runtime: `BETTER_AUTH_URL`,
`AUTH_SECRET`, `KEYCLOAK_CLIENT_ID`, `KEYCLOAK_CLIENT_SECRET`, `KEYCLOAK_ISSUER`, `API_GRAPHQL_ENDPOINT`,
`SUBSONIC_URL`, `MEDIA_ORIGIN`, `SPEXFLIX_WEB_URL`, `SPEXREGISTER_WEB_URL`, `SUPPORT_EMAIL`, `FEEDBACK_EMAIL`, `SUPPORTED_LOCALES`, `DEFAULT_LOCALE`, `FGV_REVIVAL_WEB_URL`, `SPEXGRAM_WEB_URL`, `ARCHIVE_WEB_URL`, `UMAMI_URL` and
`UMAMI_WEBSITE_ID`. Visitor statistics go to Umami only when both Umami variables are set.
[fgv-spexify-deploy][8] runs it.

## Building and Deployment

### Tests

`npm run test` runs the unit tests and `npm run test:e2e` the Playwright tests, against `e2e/mock-backend.mjs`, which
also acts as Keycloak. See the [contributor guidelines][5] for the checks CI runs.

### Production Build

To create an optimized production build manually:

```bash
npm run build
npm run start
```

## Contributing

Contributors to this project agree to uphold its [code of conduct][3].

You can contribute to Spexify Web by:

- Opening a [pull request][4]. Please see the [contributor guidelines][5] for details

## License

Spexify Web is open source software released under the [Apache 2.0 license][6].

[1]: https://github.com/bloomper/fgv-spexify-server

[2]: https://github.com/bloomper/fgv-spexify-spec

[3]: CODE_OF_CONDUCT.md

[4]: https://help.github.com/articles/using-pull-requests/

[5]: CONTRIBUTING.md

[6]: https://www.apache.org/licenses/LICENSE-2.0.html

[7]: https://github.com/bloomper/fgv-keycloak

[8]: https://github.com/bloomper/fgv-spexify-deploy
