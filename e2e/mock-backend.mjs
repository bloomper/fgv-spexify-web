// A stand-in for Spexify Server and Keycloak in E2E tests: GraphQL for the catalogue, editing, administration and the
// user's app passwords, tus uploads, covers, the media and Subsonic endpoints the web calls (stars and playlists), and a mini-Keycloak (discovery, authorize, token, JWKS, userinfo, logout).
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

// As Spexify Server words them
const MESSAGES = {
    CONFLICT: "Någon annan har ändrat detta. Ladda om sidan och försök igen.",
    SPEXREGISTER_UNAVAILABLE: "Spexregistret går inte att nå just nu. Försök igen om en stund.",
};

class GraphQLError extends Error {
    constructor(classification, message) {
        super(message);
        this.classification = classification;
    }
}

/** The UUID the server would give the entity numbered n here. */
const uuidOf = n => `00000000-0000-7000-8000-${String(n).padStart(12, "0")}`;

const SPEX = {id: uuidOf(1), title: "Nobel", year: 1975, revival: false, categoryId: uuidOf(1), categoryName: "Chalmersspexet"};

function track(id, albumId, albumTitle, number, title, extra = {}) {
    return {
        id, albumId, albumTitle, discNumber: 1, trackNumber: number, title,
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
            {id: uuidOf(1), title: "Nobel", year: 1975, kind: "SHOW", description: "Inspelat 1975.", hasCover: false,
                published: true, publishedAt: "2026-10-01T10:00:00Z", trashedAt: null, navidromeId: "al-1",
                createdAt: "2026-10-01T10:00:00Z", lastModifiedAt: null, spex: SPEX},
            {id: uuidOf(2), title: "Opublicerat album", year: 2026, kind: "STUDIO", description: null, hasCover: false,
                published: false, publishedAt: null, trashedAt: null, navidromeId: null,
                createdAt: "2026-10-02T10:00:00Z", lastModifiedAt: null, spex: null},
        ],
        tracks: [
            track(uuidOf(11), uuidOf(1), "Nobel", 1, "Ouvertyr"),
            track(uuidOf(12), uuidOf(1), "Nobel", 2, "Kärleksduetten"),
            track(uuidOf(21), uuidOf(2), "Opublicerat album", 1, "Hemlig låt", {published: false, listed: false, navidromeId: null}),
        ],
        starred: [],
        playlists: [{id: "pl-1", name: "Favoriter", entries: [`nd-${uuidOf(11)}`]}],
        appPasswords: [],
        apiKeys: [],
        users: [
            {id: "u-1", username: "lisa@example.org", displayName: "Lisa Lyssnare", lastSeenAt: "2026-10-30T10:00:00Z",
                appPasswordCount: 2, apiKeyCount: 0, locked: false},
            {id: "u-2", username: "olle@example.org", displayName: "Olle Spärrad", lastSeenAt: "2026-10-29T10:00:00Z",
                appPasswordCount: 0, apiKeyCount: 1, locked: true},
        ],
        settings: {welcomeSv: null, welcomeEn: null, appPasswordExpiryMonths: 12, lockoutAttempts: 10, lockoutMinutes: 15},
        audit: [],
        uploads: new Map(),
        scanRequested: false,
        spexregisterUp: true,
        navidromeUp: true,
        // Operation name -> classification of the error its next call answers with
        failNext: new Map(),
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
const tracksOf = (persona, albumId) => state.tracks
    .filter(t => t.albumId === albumId && (isEditor(persona) ? !t.trashedAt : t.listed))
    .sort((a, b) => a.discNumber - b.discNumber || a.trackNumber - b.trackNumber);
const withCounts = (persona, album) => {
    const tracks = tracksOf(persona, album.id);

    return {...album, trackCount: tracks.length, durationMs: tracks.reduce((sum, t) => sum + t.durationMs, 0)};
};
const isAdmin = persona => persona.roles.includes("ADMIN");

function requireEditor(persona) {
    if (!isEditor(persona)) {
        throw forbidden();
    }
}

function requireAdmin(persona) {
    if (!isAdmin(persona)) {
        throw forbidden();
    }
}

function audit(persona, action, entityType, entityId, summary) {
    state.audit.unshift({id: String(state.nextId++), at: new Date().toISOString(), actorName: persona.name, action, entityType,
        entityId, summary, actor: persona.sub});
}

const albumById = id => {
    const album = state.albums.find(candidate => candidate.id === id);

    if (!album) {
        throw new GraphQLError("NOT_FOUND", "Albumet finns inte.");
    }
    return album;
};
const trackById = id => {
    const found = state.tracks.find(candidate => candidate.id === id);

    if (!found) {
        throw new GraphQLError("NOT_FOUND", "Låten finns inte.");
    }
    return found;
};
// A track is listed when it, and its album, are published and neither is in the trash
const relist = () => state.tracks.forEach(t => {
    const album = state.albums.find(candidate => candidate.id === t.albumId);

    t.listed = Boolean(t.published && !t.trashedAt && album?.published && !album?.trashedAt);
    t.navidromeId = t.listed ? `nd-${t.id}` : null;
});
const renumber = albumId => state.tracks.filter(t => t.albumId === albumId && !t.trashedAt)
    .sort((a, b) => a.trackNumber - b.trackNumber)
    .forEach((t, index) => t.trackNumber = index + 1);
const trackFromUpload = (persona, albumId, uploadId) => {
    const upload = state.uploads.get(uploadId);

    if (!upload || upload.offset < upload.length) {
        throw new GraphQLError("BAD_REQUEST", "Uppladdningen är inte klar.");
    }
    if (!/\.(flac|mp3|m4a|aac|ogg|oga|opus|wav)$/i.test(upload.name)) {
        throw new GraphQLError("BAD_REQUEST", "Filen är inte ljud i ett format som stöds.");
    }
    state.uploads.delete(uploadId);
    return upload;
};

const resolvers = {
    Me: persona => ({
        me: {username: persona.email, displayName: persona.name, roles: persona.roles, spexflixUser: false},
        settings: state.settings,
    }),
    Home: persona => ({
        recentAlbums: state.albums.filter(album => album.published && !album.trashedAt).map(album => withCounts(persona, album)),
        categories: [{id: uuidOf(1), name: "Chalmersspexet", albumCount: 1}],
        years: [1975],
    }),
    Albums: (persona, {filter}) => ({
        albums: visibleAlbums(persona).filter(album => album.published || filter?.includeUnpublished).map(album => withCounts(persona, album)),
        categories: [{id: uuidOf(1), name: "Chalmersspexet", albumCount: 1}],
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
        settings: state.settings,
    }),
    AppPasswordCreate: (persona, {name}) => {
        const created = {id: uuidOf(state.nextId++), name, createdAt: new Date().toISOString(), lastUsedAt: null,
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

        const album = {id: uuidOf(state.nextId++), title: input.title || SPEX.title, year: input.year ?? SPEX.year,
            kind: input.kind, description: input.description, hasCover: false, published: false, publishedAt: null,
            trashedAt: null, navidromeId: null, createdAt: new Date().toISOString(), lastModifiedAt: null,
            spex: input.spexId ? SPEX : null};

        state.albums.push(album);
        audit(persona, "CREATE", "ALBUM", album.id, `Skapade albumet ${album.title}`);
        return {albumCreate: {id: album.id}};
    },
    AlbumPublish: (persona, {id, published}) => {
        if (!isEditor(persona)) {
            throw forbidden();
        }

        const album = state.albums.find(candidate => candidate.id === id);

        album.published = published;
        relist();
        audit(persona, published ? "PUBLISH" : "UNPUBLISH", "ALBUM", id, `${published ? "Publicerade" : "Avpublicerade"} albumet ${album.title}`);
        return {albumPublish: {id, published}};
    },
    SpexSearch: persona => {
        requireEditor(persona);
        if (!state.spexregisterUp) {
            throw new GraphQLError("SPEXREGISTER_UNAVAILABLE", MESSAGES.SPEXREGISTER_UNAVAILABLE);
        }
        return {spexSearch: [{id: SPEX.id, title: SPEX.title, year: SPEX.year, revival: false, categoryName: SPEX.categoryName}]};
    },
    LibraryStatus: persona => {
        if (!persona.roles.includes("ADMIN")) {
            throw forbidden();
        }
        return {libraryStatus: {navidromeAvailable: state.navidromeUp, scanning: false, scanPending: state.scanRequested,
            lastScanAt: "2026-10-31T10:00:00Z", lastScanError: null, trackCount: state.tracks.length,
            listedTrackCount: state.tracks.filter(t => t.listed).length}};
    },
    LibraryRescan: persona => {
        requireAdmin(persona);
        state.scanRequested = true;
        return {libraryRescan: null};
    },
    AlbumUpdate: (persona, {id, input}) => {
        requireEditor(persona);

        const album = albumById(id);

        Object.assign(album, {title: input.title || album.title, year: input.year ?? album.year, kind: input.kind,
            description: input.description ?? null, lastModifiedAt: new Date().toISOString()});
        state.tracks.filter(t => t.albumId === id).forEach(t => t.albumTitle = album.title);
        audit(persona, "UPDATE", "ALBUM", id, `Ändrade albumet ${album.title}`);
        return {albumUpdate: {id}};
    },
    AlbumTrash: (persona, {id}) => {
        requireEditor(persona);

        const album = albumById(id);

        album.trashedAt = new Date().toISOString();
        relist();
        audit(persona, "TRASH", "ALBUM", id, `Lade albumet ${album.title} i papperskorgen`);
        return {albumTrash: {id}};
    },
    AlbumRestore: (persona, {id}) => {
        requireEditor(persona);
        albumById(id).trashedAt = null;
        relist();
        return {albumRestore: {id}};
    },
    AlbumDelete: (persona, {id}) => {
        requireAdmin(persona);
        state.albums = state.albums.filter(album => album.id !== id);
        state.tracks = state.tracks.filter(t => t.albumId !== id);
        return {albumDelete: null};
    },
    AlbumCoverRemove: (persona, {id}) => {
        requireEditor(persona);
        albumById(id).hasCover = false;
        return {albumCoverRemove: {id}};
    },
    TracksReorder: (persona, {albumId, trackIds}) => {
        requireEditor(persona);
        trackIds.forEach((id, index) => trackById(id).trackNumber = index + 1);
        return {tracksReorder: {id: albumId}};
    },
    TrackCreate: (persona, {albumId, uploadId}) => {
        requireEditor(persona);

        const album = albumById(albumId);
        const upload = trackFromUpload(persona, albumId, uploadId);
        const number = state.tracks.filter(t => t.albumId === albumId && !t.trashedAt).length + 1;
        const created = track(uuidOf(state.nextId++), albumId, album.title, number, upload.name.replace(/^\d+\s*/, "").replace(/\.[^.]+$/, ""),
            {performers: null, melody: null, lyrics: null, lyricsSynced: false, fileSize: upload.length, published: true});

        state.tracks.push(created);
        relist();
        audit(persona, "CREATE", "TRACK", created.id, `Laddade upp ${created.title} till ${album.title}`);
        return {trackCreate: {id: created.id, title: created.title}};
    },
    TrackUpdate: (persona, {id, input}) => {
        requireEditor(persona);

        const found = trackById(id);

        Object.assign(found, input);
        audit(persona, "UPDATE", "TRACK", id, `Ändrade ${found.title}`);
        return {trackUpdate: {id}};
    },
    TrackReplaceAudio: (persona, {id, uploadId}) => {
        requireEditor(persona);

        const found = trackById(id);
        const upload = trackFromUpload(persona, found.albumId, uploadId);

        Object.assign(found, {fileSize: upload.length, fileMissing: false, format: upload.name.split(".").pop().toUpperCase()});
        audit(persona, "UPDATE", "TRACK", id, `Bytte ljudfil för ${found.title}`);
        return {trackReplaceAudio: {id}};
    },
    TrackPublish: (persona, {id, published}) => {
        requireEditor(persona);
        trackById(id).published = published;
        relist();
        return {trackPublish: {id, published}};
    },
    TrackTrash: (persona, {id}) => {
        requireEditor(persona);

        const found = trackById(id);

        found.trashedAt = new Date().toISOString();
        relist();
        renumber(found.albumId);
        return {trackTrash: {id}};
    },
    TrackRestore: (persona, {id}) => {
        requireEditor(persona);

        const found = trackById(id);

        found.trashedAt = null;
        found.trackNumber = 999;
        renumber(found.albumId);
        relist();
        return {trackRestore: {id}};
    },
    TrackDelete: (persona, {id}) => {
        requireAdmin(persona);
        state.tracks = state.tracks.filter(t => t.id !== id);
        return {trackDelete: null};
    },
    TrashEmpty: persona => {
        requireAdmin(persona);

        const trashedAlbums = new Set(state.albums.filter(album => album.trashedAt).map(album => album.id));

        state.albums = state.albums.filter(album => !trashedAlbums.has(album.id));
        state.tracks = state.tracks.filter(t => !t.trashedAt && !trashedAlbums.has(t.albumId));
        return {trashEmpty: null};
    },
    Trash: persona => {
        requireEditor(persona);

        const trashedAlbums = state.albums.filter(album => album.trashedAt);

        return {trash: {
            albums: trashedAlbums.map(album => ({...album, trackCount: state.tracks.filter(t => t.albumId === album.id).length})),
            tracks: state.tracks.filter(t => t.trashedAt && !trashedAlbums.some(album => album.id === t.albumId)),
        }};
    },
    AuditLog: (persona, {page = 0, size = 50}) => {
        requireEditor(persona);

        const entries = state.audit.filter(entry => isAdmin(persona) || entry.actor === persona.sub);

        return {auditLog: {entries: entries.slice(page * size, (page + 1) * size), totalCount: entries.length, page, size}};
    },
    Settings: () => ({settings: state.settings}),
    SettingsUpdate: (persona, {input}) => {
        requireAdmin(persona);
        if (input.lockoutAttempts < 1 || input.appPasswordExpiryMonths < 1) {
            throw new GraphQLError("BAD_REQUEST", "Uppgifterna är inte giltiga.");
        }
        state.settings = {...input};
        return {settingsUpdate: state.settings};
    },
    Users: persona => {
        requireAdmin(persona);
        return {users: state.users};
    },
    UserUnlock: (persona, {userId}) => {
        requireAdmin(persona);
        state.users.find(user => user.id === userId).locked = false;
        return {userUnlock: null};
    },
    UserCredentialsRevoke: (persona, {userId}) => {
        requireAdmin(persona);
        Object.assign(state.users.find(user => user.id === userId), {appPasswordCount: 0, apiKeyCount: 0});
        return {userCredentialsRevoke: null};
    },
    ApiKeyCreate: (persona, {name}) => {
        const created = {id: uuidOf(state.nextId++), name, createdAt: new Date().toISOString(), lastUsedAt: null};

        state.apiKeys.push(created);
        return {apiKeyCreate: {key: "e2e-api-key-0123456789abcdef", apiKey: created}};
    },
    ApiKeyRevoke: (persona, {id}) => {
        state.apiKeys = state.apiKeys.filter(key => key.id !== id);
        return {apiKeyRevoke: null};
    },
    TracksByIds: (persona, {ids}) => ({
        tracksByIds: ids.map(id => state.tracks.find(t => t.id === id && t.listed)).filter(Boolean)
            .map(t => ({...t, spexId: state.albums.find(album => album.id === t.albumId)?.spex?.id ?? null})),
    }),
};

function subsonic(res, payload) {
    res.writeHead(200, {"content-type": "application/json"}).end(JSON.stringify({"subsonic-response": {status: "ok", version: "1.16.1", ...payload}}));
}

const playlistOf = playlist => ({id: playlist.id, name: playlist.name, songCount: playlist.entries.length,
    duration: playlist.entries.length * 61, created: "2026-10-01T10:00:00Z", changed: "2026-10-01T10:00:00Z"});

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
        subsonic(res, {playlists: {playlist: state.playlists.map(playlistOf)}});
    } else if (endpoint === "getPlaylist") {
        const playlist = state.playlists.find(candidate => candidate.id === id);

        if (!playlist) {
            res.writeHead(200, {"content-type": "application/json"}).end(JSON.stringify({"subsonic-response": {status: "failed",
                version: "1.16.1", error: {code: 70, message: "Playlist not found"}}}));
            return;
        }
        subsonic(res, {playlist: {...playlistOf(playlist), entry: playlist.entries.map(navidromeId => ({id: navidromeId, title: "", album: "", albumId: ""}))}});
    } else if (endpoint === "createPlaylist") {
        state.playlists.push({id: `pl-${state.nextId++}`, name: url.searchParams.get("name"), entries: url.searchParams.getAll("songId")});
        subsonic(res, {});
    } else if (endpoint === "updatePlaylist") {
        const playlist = state.playlists.find(candidate => candidate.id === url.searchParams.get("playlistId"));

        playlist.entries.push(...url.searchParams.getAll("songIdToAdd"));
        url.searchParams.getAll("songIndexToRemove").map(Number).sort((a, b) => b - a).forEach(index => playlist.entries.splice(index, 1));
        subsonic(res, {});
    } else if (endpoint === "deletePlaylist") {
        state.playlists = state.playlists.filter(candidate => candidate.id !== id);
        subsonic(res, {});
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
        const failure = state.failNext.get(op);

        if (failure) {
            state.failNext.delete(op);
            throw new GraphQLError(failure, MESSAGES[failure] ?? "Något gick fel.");
        }
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

// A 1×1 PNG, for covers
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64");

// --- tus ------------------------------------------------------------------------------------------------------------

function handleTus(req, path, body, res) {
    const headers = {"tus-resumable": "1.0.0"};
    const id = path.split("/")[3];
    const persona = personaOf(req);

    if (req.method === "OPTIONS") {
        res.writeHead(204, {...headers, "tus-version": "1.0.0", "tus-extension": "creation,termination", "tus-max-size": "2147483648"}).end();
    } else if (!persona || !isEditor(persona)) {
        res.writeHead(403, {"content-type": "application/json"}).end(JSON.stringify({code: "FORBIDDEN", message: "Du har inte behörighet att göra det."}));
    } else if (req.method === "POST") {
        const upload = randomUUID();
        const metadata = Object.fromEntries((req.headers["upload-metadata"] ?? "").split(",").filter(Boolean)
            .map(pair => pair.trim().split(" ")).map(([key, value]) => [key, Buffer.from(value ?? "", "base64").toString("utf8")]));

        state.uploads.set(upload, {name: metadata.filename ?? "upload", length: Number(req.headers["upload-length"]), offset: 0});
        res.writeHead(201, {...headers, location: `/api/uploads/${upload}`}).end();
    } else if (!state.uploads.has(id)) {
        res.writeHead(404, headers).end();
    } else if (req.method === "HEAD") {
        const upload = state.uploads.get(id);

        res.writeHead(200, {...headers, "upload-offset": String(upload.offset), "upload-length": String(upload.length), "cache-control": "no-store"}).end();
    } else if (req.method === "PATCH") {
        const upload = state.uploads.get(id);

        if (Number(req.headers["upload-offset"]) !== upload.offset) {
            res.writeHead(409, headers).end();
            return;
        }
        upload.offset += body.length;
        res.writeHead(204, {...headers, "upload-offset": String(upload.offset)}).end();
    } else if (req.method === "DELETE") {
        state.uploads.delete(id);
        res.writeHead(204, headers).end();
    } else {
        res.writeHead(405).end();
    }
}

const server = createServer((req, res) => {
    const chunks = [];
    req.on("data", chunk => chunks.push(chunk));
    req.on("end", () => handle(req, res, chunks).catch(error => {
        // A broken handler answers 500 instead of taking the mock down for every later test
        console.error(error);
        if (!res.headersSent) {
            res.writeHead(500).end();
        }
    }));
});

async function handle(req, res, chunks) {
    {
        const url = new URL(req.url || "", `http://localhost:${PORT}`);
        const path = url.pathname;
        const rawBody = Buffer.concat(chunks);
        const body = rawBody.toString("utf8");

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
        } else if (req.method === "POST" && path === "/__spexregister") {
            state.spexregisterUp = JSON.parse(body).up;
            res.writeHead(204).end();
        } else if (req.method === "POST" && path === "/__navidrome") {
            state.navidromeUp = JSON.parse(body).up;
            res.writeHead(204).end();
        } else if (req.method === "POST" && path === "/__fail") {
            const {operation, classification} = JSON.parse(body);

            state.failNext.set(operation, classification);
            res.writeHead(204).end();
        } else if (req.method === "GET" && path === "/__state") {
            res.writeHead(200, {"content-type": "application/json"}).end(JSON.stringify({
                uploads: state.uploads.size, scanRequested: state.scanRequested, starred: state.starred,
                tracks: state.tracks.map(({id, albumId, title, trackNumber, published, listed, trashedAt}) =>
                    ({id, albumId, title, trackNumber, published, listed, trashedAt})),
                albums: state.albums.map(({id, title, published, hasCover, trashedAt}) => ({id, title, published, hasCover, trashedAt})),
            }));
        } else if (req.method === "GET" && /^\/api\/albums\/[^/]+\/cover$/.test(path)) {
            const album = state.albums.find(candidate => candidate.id === path.split("/")[3]);

            if (album?.hasCover) {
                res.writeHead(200, {"content-type": "image/png"}).end(PNG);
            } else {
                res.writeHead(404).end();
            }
        } else if (req.method === "POST" && /^\/api\/albums\/[^/]+\/cover$/.test(path)) {
            const album = state.albums.find(candidate => candidate.id === path.split("/")[3]);

            if (!isEditor(personaOf(req) ?? {roles: []})) {
                res.writeHead(403, {"content-type": "application/json"}).end(JSON.stringify({code: "FORBIDDEN", message: "Du har inte behörighet att göra det."}));
            } else {
                album.hasCover = true;
                res.writeHead(200, {"content-type": "application/json"}).end(JSON.stringify({id: album.id, title: album.title, hasCover: true}));
            }
        } else if (path === "/api/uploads" || path.startsWith("/api/uploads/")) {
            handleTus(req, path, rawBody, res);
        } else if (req.method === "GET" && /^\/api\/tracks\/[^/]+\/(audio|download)$/.test(path)) {
            res.writeHead(200, {"content-type": "audio/flac", "accept-ranges": "bytes"}).end(Buffer.alloc(16));
        } else if (path.startsWith("/rest/")) {
            if (!personaOf(req)) {
                res.writeHead(401).end();
            } else if (!state.navidromeUp) {
                res.writeHead(503).end();
            } else {
                handleRest(url, res);
            }
        } else if (req.method === "POST" && path.includes("/api/graphql")) {
            handleGraphql(req, body, res);
        } else {
            res.writeHead(404).end();
        }
    }
}

server.listen(PORT, () => {
    console.log(`[mock-backend] listening on http://localhost:${PORT}`);
});
