// A stand-in for Spexify Server and Keycloak in E2E tests: GraphQL for the catalogue and the user's app passwords, the
// media and Subsonic endpoints the web calls, and a mini-Keycloak (discovery, authorize, token, JWKS, userinfo, logout).
// All data is fictitious.

import {createServer} from "node:http";
import {randomUUID} from "node:crypto";
import {exportJWK, generateKeyPair, SignJWT} from "jose";

const PORT = Number(process.env.MOCK_PORT || 4101);
const ISSUER = `http://localhost:${PORT}/realms/fgv`;
const CLIENT_ID = "fgv-spexify";
const KID = "e2e-key";
const TOKEN_TTL = 3600;

const PERSONAS = {
    admin: {sub: "p-admin", name: "Sara Admin", email: "sara.admin@example.org", roles: ["USER", "ADMIN"]},
    editor: {sub: "p-editor", name: "Erik Redaktör", email: "erik@example.org", roles: ["USER", "EDITOR"]},
    listener: {sub: "p-listener", name: "Lisa Lyssnare", email: "lisa@example.org", roles: ["USER"]},
    noaccess: {sub: "p-noaccess", name: "Nils Nekad", email: "nils@example.org", roles: []},
};
const bySub = Object.fromEntries(Object.values(PERSONAS).map(persona => [persona.sub, persona]));
let currentPersona = "admin";

class GraphQLError extends Error {
    constructor(classification, message) {
        super(message);
        this.classification = classification;
    }
}

const SPEX = {id: "1", title: "Nobel", year: 1975, revival: false, categoryId: "1", categoryName: "Chalmersspexet"};

function track(id, albumId, albumTitle, number, title, extra = {}) {
    return {
        id, uuid: randomUUID(), albumId, albumTitle, discNumber: 1, trackNumber: number, title,
        performers: "Kungen, Drottningen", melody: "Dancing Queen (ABBA)", lyricsAuthor: null, arranger: null,
        lyrics: "[00:00.50]Här står vi nu på scenen", lyricsSynced: true, format: "FLAC", fileSize: 1000000,
        durationMs: 61000, bitrate: 900, published: true, listed: true, trashedAt: null, navidromeId: `nd-${id}`,
        fileMissing: false, videoLinks: [], ...extra,
    };
}

let state;

function resetState() {
    state = {
        nextId: 100,
        albums: [
            {id: "1", uuid: randomUUID(), title: "Nobel", year: 1975, kind: "SHOW", description: "Inspelat 1975.", hasCover: false,
                published: true, publishedAt: "2026-10-01T10:00:00Z", trashedAt: null, navidromeId: "al-1",
                createdAt: "2026-10-01T10:00:00Z", lastModifiedAt: null, spex: SPEX},
            {id: "2", uuid: randomUUID(), title: "Opublicerat album", year: 2026, kind: "STUDIO", description: null, hasCover: false,
                published: false, publishedAt: null, trashedAt: null, navidromeId: null,
                createdAt: "2026-10-02T10:00:00Z", lastModifiedAt: null, spex: null},
        ],
        tracks: [
            track("11", "1", "Nobel", 1, "Ouvertyr"),
            track("12", "1", "Nobel", 2, "Kärleksduetten"),
            track("21", "2", "Opublicerat album", 1, "Hemlig låt", {published: false, listed: false, navidromeId: null}),
        ],
        starred: [],
        appPasswords: [],
        apiKeys: [],
    };
}

resetState();

const isEditor = persona => persona.roles.includes("EDITOR") || persona.roles.includes("ADMIN");
const forbidden = () => new GraphQLError("FORBIDDEN", "Du har inte behörighet att göra det.");

function requireUser(persona) {
    if (!persona) {
        throw new GraphQLError("UNAUTHORIZED", "Du är inte inloggad.");
    }
    if (!persona.roles.includes("USER")) {
        throw forbidden();
    }
    return persona;
}

const visibleAlbums = persona => state.albums.filter(album => !album.trashedAt && (album.published || isEditor(persona)));
const tracksOf = (persona, albumId) => state.tracks.filter(t => t.albumId === albumId && (isEditor(persona) ? !t.trashedAt : t.listed));
const withCounts = (persona, album) => {
    const tracks = tracksOf(persona, album.id);

    return {...album, trackCount: tracks.length, durationMs: tracks.reduce((sum, t) => sum + t.durationMs, 0)};
};
const settings = {welcomeSv: null, welcomeEn: null, appPasswordExpiryMonths: 12, lockoutAttempts: 10, lockoutMinutes: 15};

const resolvers = {
    Me: persona => ({
        me: {username: persona.email, displayName: persona.name, roles: persona.roles, spexflixUser: false},
        settings,
    }),
    Home: persona => ({
        recentAlbums: state.albums.filter(album => album.published && !album.trashedAt).map(album => withCounts(persona, album)),
        categories: [{id: "1", name: "Chalmersspexet", albumCount: 1}],
        years: [1975],
    }),
    Albums: (persona, {filter}) => ({
        albums: visibleAlbums(persona).filter(album => album.published || filter?.includeUnpublished).map(album => withCounts(persona, album)),
        categories: [{id: "1", name: "Chalmersspexet", albumCount: 1}],
        years: [1975],
    }),
    Album: (persona, {id}) => {
        const album = visibleAlbums(persona).find(candidate => candidate.id === id);

        return {album: album ? {...withCounts(persona, album), tracks: tracksOf(persona, id)} : null};
    },
    Search: (persona, {q}) => ({
        search: {
            albums: visibleAlbums(persona).filter(album => album.title.toLowerCase().includes(q.toLowerCase())).map(album => withCounts(persona, album)),
            tracks: state.tracks.filter(t => t.listed && t.title.toLowerCase().includes(q.toLowerCase())),
        },
    }),
    TracksByNavidromeIds: (persona, {ids}) => ({tracksByNavidromeIds: ids.map(id => state.tracks.find(t => t.navidromeId === id)).filter(Boolean)}),
    Apps: persona => ({
        me: {username: persona.email, displayName: persona.name},
        appPasswords: state.appPasswords,
        apiKeys: state.apiKeys,
        settings,
    }),
    AppPasswordCreate: (persona, {name}) => {
        const created = {id: String(state.nextId++), name, createdAt: new Date().toISOString(), lastUsedAt: null,
            expiresAt: new Date(Date.now() + 365 * 86400000).toISOString(), expired: false};

        state.appPasswords.push(created);
        return {appPasswordCreate: {password: "abcd-efgh-ijkm-npqr-stuv-wxyz", username: persona.email, appPassword: created}};
    },
    AppPasswordRevoke: (persona, {id}) => {
        state.appPasswords = state.appPasswords.filter(password => password.id !== id);
        return {appPasswordRevoke: null};
    },
    AlbumCreate: (persona, {input}) => {
        if (!isEditor(persona)) {
            throw forbidden();
        }

        const album = {id: String(state.nextId++), uuid: randomUUID(), title: input.title || SPEX.title, year: input.year ?? SPEX.year,
            kind: input.kind, description: input.description, hasCover: false, published: false, publishedAt: null,
            trashedAt: null, navidromeId: null, createdAt: new Date().toISOString(), lastModifiedAt: null,
            spex: input.spexId ? SPEX : null};

        state.albums.push(album);
        return {albumCreate: {id: album.id}};
    },
    AlbumPublish: (persona, {id, published}) => {
        if (!isEditor(persona)) {
            throw forbidden();
        }

        const album = state.albums.find(candidate => candidate.id === id);

        album.published = published;
        return {albumPublish: {id, published}};
    },
    SpexSearch: persona => {
        if (!isEditor(persona)) {
            throw forbidden();
        }
        return {spexSearch: [{id: SPEX.id, title: SPEX.title, year: SPEX.year, revival: false, categoryName: SPEX.categoryName}]};
    },
    LibraryStatus: persona => {
        if (!persona.roles.includes("ADMIN")) {
            throw forbidden();
        }
        return {libraryStatus: {navidromeAvailable: true, scanning: false, scanPending: false, lastScanAt: "2026-10-31T10:00:00Z",
            lastScanError: null, trackCount: 3, listedTrackCount: 2}};
    },
};

function subsonic(res, payload) {
    res.writeHead(200, {"content-type": "application/json"}).end(JSON.stringify({"subsonic-response": {status: "ok", version: "1.16.1", ...payload}}));
}

function handleRest(url, res) {
    const endpoint = url.pathname.slice("/rest/".length);
    const id = url.searchParams.get("id");

    if (endpoint === "getStarred2") {
        subsonic(res, {starred2: {song: state.starred.map(navidromeId => ({id: navidromeId, title: "", album: "", albumId: ""}))}});
    } else if (endpoint === "star") {
        state.starred.push(id);
        subsonic(res, {});
    } else if (endpoint === "unstar") {
        state.starred = state.starred.filter(candidate => candidate !== id);
        subsonic(res, {});
    } else if (endpoint === "getPlaylists") {
        subsonic(res, {playlists: {playlist: []}});
    } else {
        subsonic(res, {});
    }
}

function operationNameOf(query) {
    const match = /\b(query|mutation)\s+([A-Za-z0-9_]+)/.exec(query);
    return match ? match[2] : null;
}

function personaOf(req) {
    const token = (req.headers.authorization ?? "").replace(/^Bearer\s+/i, "");
    try {
        const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
        return bySub[payload.sub] ?? null;
    } catch {
        return null;
    }
}

function handleGraphql(req, body, res) {
    let payload;
    try {
        payload = JSON.parse(body);
    } catch {
        res.writeHead(400).end('{"errors":[{"message":"bad json"}]}');
        return;
    }
    const op = operationNameOf(payload.query || "");
    const resolver = op && resolvers[op];
    res.writeHead(200, {"content-type": "application/json"});
    if (!resolver) {
        res.end(JSON.stringify({data: {}}));
        return;
    }
    try {
        const persona = requireUser(personaOf(req));
        res.end(JSON.stringify({data: resolver(persona, payload.variables || {})}));
    } catch (error) {
        if (error instanceof GraphQLError) {
            res.end(JSON.stringify({
                data: null,
                errors: [{message: error.message, extensions: {classification: error.classification}}]
            }));
        } else {
            console.error(error);
            res.end(JSON.stringify({
                data: null,
                errors: [{message: String(error), extensions: {classification: "INTERNAL_ERROR"}}]
            }));
        }
    }
}

// --- OIDC ----------------------------------------------------------------------------------------------------------

const oidcConfig = {
    issuer: ISSUER,
    authorization_endpoint: `${ISSUER}/protocol/openid-connect/auth`,
    token_endpoint: `${ISSUER}/protocol/openid-connect/token`,
    userinfo_endpoint: `${ISSUER}/protocol/openid-connect/userinfo`,
    jwks_uri: `${ISSUER}/protocol/openid-connect/certs`,
    end_session_endpoint: `${ISSUER}/protocol/openid-connect/logout`,
    response_types_supported: ["code"],
    subject_types_supported: ["public"],
    id_token_signing_alg_values_supported: ["RS256"],
};

const {privateKey, publicKey} = await generateKeyPair("RS256", {extractable: true});
const publicJwk = {...(await exportJWK(publicKey)), kid: KID, alg: "RS256", use: "sig"};
const pendingCodes = new Map();

const userClaims = persona => ({
    sub: persona.sub,
    name: persona.name,
    email: persona.email,
    email_verified: true,
    preferred_username: persona.email
});

const signJwt = (persona, claims, audience) =>
    new SignJWT(claims)
        .setProtectedHeader({alg: "RS256", kid: KID, typ: "JWT"})
        .setIssuer(ISSUER)
        .setSubject(persona.sub)
        .setAudience(audience)
        .setIssuedAt()
        .setExpirationTime(`${TOKEN_TTL}s`)
        .sign(privateKey);

function handleAuthorize(url, res) {
    const redirectUri = url.searchParams.get("redirect_uri");
    if (!redirectUri) {
        res.writeHead(400).end("missing redirect_uri");
        return;
    }
    const code = randomUUID();
    pendingCodes.set(code, {nonce: url.searchParams.get("nonce"), persona: PERSONAS[currentPersona]});
    const target = new URL(redirectUri);
    target.searchParams.set("code", code);
    const stateParam = url.searchParams.get("state");
    if (stateParam) {
        target.searchParams.set("state", stateParam);
    }
    res.writeHead(302, {location: target.toString()}).end();
}

async function handleToken(body, res) {
    const params = new URLSearchParams(body);
    let pending = {nonce: null, persona: PERSONAS[currentPersona]};

    if (params.get("grant_type") === "authorization_code") {
        const code = params.get("code");
        if (!pendingCodes.has(code)) {
            res.writeHead(400, {"content-type": "application/json"}).end(JSON.stringify({error: "invalid_grant"}));
            return;
        }
        pending = pendingCodes.get(code);
        pendingCodes.delete(code);
    }
    const {persona, nonce} = pending;
    res.writeHead(200, {"content-type": "application/json"});
    res.end(JSON.stringify({
        access_token: await signJwt(persona, {
            ...userClaims(persona),
            typ: "Bearer",
            azp: CLIENT_ID,
            resource_access: {[CLIENT_ID]: {roles: persona.roles}}
        }, "account"),
        id_token: await signJwt(persona, {...userClaims(persona), ...(nonce ? {nonce} : {})}, CLIENT_ID),
        refresh_token: `refresh-${randomUUID()}`,
        token_type: "Bearer",
        expires_in: TOKEN_TTL,
        scope: "openid profile email",
    }));
}

const server = createServer((req, res) => {
    const chunks = [];
    req.on("data", chunk => chunks.push(chunk));
    req.on("end", async () => {
        const url = new URL(req.url || "", `http://localhost:${PORT}`);
        const path = url.pathname;
        const body = Buffer.concat(chunks).toString("utf8");

        if (path.endsWith("/.well-known/openid-configuration")) {
            res.writeHead(200, {"content-type": "application/json"}).end(JSON.stringify(oidcConfig));
        } else if (path.endsWith("/protocol/openid-connect/certs")) {
            res.writeHead(200, {"content-type": "application/json"}).end(JSON.stringify({keys: [publicJwk]}));
        } else if (path.endsWith("/protocol/openid-connect/auth")) {
            handleAuthorize(url, res);
        } else if (path.endsWith("/protocol/openid-connect/token")) {
            await handleToken(body, res);
        } else if (path.endsWith("/protocol/openid-connect/userinfo")) {
            const persona = personaOf(req) ?? PERSONAS[currentPersona];
            res.writeHead(200, {"content-type": "application/json"}).end(JSON.stringify(userClaims(persona)));
        } else if (path.endsWith("/protocol/openid-connect/logout")) {
            res.writeHead(302, {location: url.searchParams.get("post_logout_redirect_uri") || `http://localhost:${PORT}/`}).end();
        } else if (req.method === "POST" && path === "/__reset") {
            resetState();
            currentPersona = "admin";
            res.writeHead(204).end();
        } else if (req.method === "POST" && path === "/__persona") {
            currentPersona = JSON.parse(body).persona;
            res.writeHead(204).end();
        } else if (req.method === "GET" && /^\/api\/albums\/[^/]+\/cover$/.test(path)) {
            res.writeHead(404).end();
        } else if (req.method === "GET" && /^\/api\/tracks\/[^/]+\/(audio|download)$/.test(path)) {
            res.writeHead(200, {"content-type": "audio/flac", "accept-ranges": "bytes"}).end(Buffer.alloc(16));
        } else if (path.startsWith("/rest/")) {
            if (!personaOf(req)) {
                res.writeHead(401).end();
            } else {
                handleRest(url, res);
            }
        } else if (req.method === "POST" && path.includes("/api/graphql")) {
            handleGraphql(req, body, res);
        } else {
            res.writeHead(404).end();
        }
    });
});

server.listen(PORT, () => {
    console.log(`[mock-backend] listening on http://localhost:${PORT}`);
});
