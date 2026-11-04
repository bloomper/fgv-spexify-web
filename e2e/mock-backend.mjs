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

/** The linked spex, as the server copies them from Spexregister. */
const spexOf = ids => (ids ?? []).map(id => SPEXREGISTER.find(spex => spex.id === id)).filter(Boolean);

/** The UUID the server would give the entity numbered n here. */
const uuidOf = n => `00000000-0000-7000-8000-${String(n).padStart(12, "0")}`;

const SPEX = {id: uuidOf(1), title: "Nobel", year: 1975, revival: false, parentId: null, familyId: uuidOf(1), categoryId: uuidOf(1), categoryName: "Chalmersspexet"};
const REVIVAL = {id: uuidOf(2), title: "Nobel", year: 2026, revival: true, parentId: uuidOf(1), familyId: uuidOf(1), categoryId: uuidOf(1), categoryName: "Chalmersspexet"};
const SPEXREGISTER = [SPEX, REVIVAL];

function track(id, albumId, albumTitle, number, title, extra = {}) {
    return {
        id, albumId, albumTitle, discNumber: 1, trackNumber: number, title,
        performers: "Kungen, Drottningen", melody: "Dancing Queen (ABBA)", lyricsAuthor: null, arranger: null,
        lyrics: "[00:00.50]Här står vi nu på scenen", lyricsSynced: true, format: "FLAC", fileSize: 1000000,
        durationMs: 61000, bitrate: 900, published: true, listed: true, trashedAt: null, navidromeId: `nd-${id}`,
        fileMissing: false, videoLinks: [], replayGain: {trackGain: -4.5, trackPeak: 0.95, albumGain: -4.0, albumPeak: 0.98}, ...extra,
    };
}

let state;

function resetState() {
    state = {
        nextId: 100,
        maintenanceJobs: [
            {job: "SPEX_REFRESH", schedule: "0 15 3 * * *", running: false, lastStartedAt: null, lastFinishedAt: null, lastSucceeded: null},
            {job: "UPLOAD_CLEANUP", schedule: "0 5 * * * *", running: true, lastStartedAt: "2026-11-01T10:05:00Z", lastFinishedAt: null, lastSucceeded: null},
            {job: "LOUDNESS_SCAN", schedule: "0 45 3 * * *", running: false, lastStartedAt: null, lastFinishedAt: null, lastSucceeded: null},
        ],
        kinds: [
            {id: uuidOf(901), nameSv: "Föreställning", nameEn: "Show", position: 1},
            {id: uuidOf(902), nameSv: "Studio", nameEn: "Studio", position: 2},
            {id: uuidOf(903), nameSv: "Samling", nameEn: "Compilation", position: 3},
            {id: uuidOf(904), nameSv: "Övrigt", nameEn: "Other", position: 4},
        ],
        albums: [
            {id: uuidOf(1), title: "Nobel", year: 1975, kindId: uuidOf(901), description: "Inspelat 1975.", hasCover: false,
                published: true, publishedAt: "2026-10-01T10:00:00Z", trashedAt: null, navidromeId: "al-1",
                createdAt: "2026-10-01T10:00:00Z", lastModifiedAt: null, spex: [SPEX]},
            {id: uuidOf(2), title: "Opublicerat album", year: 2026, kindId: uuidOf(902), description: null, hasCover: false,
                published: false, publishedAt: null, trashedAt: null, navidromeId: null,
                createdAt: "2026-10-02T10:00:00Z", lastModifiedAt: null, spex: []},
        ],
        tracks: [
            track(uuidOf(11), uuidOf(1), "Nobel", 1, "Ouvertyr"),
            track(uuidOf(12), uuidOf(1), "Nobel", 2, "Kärleksduetten"),
            track(uuidOf(21), uuidOf(2), "Opublicerat album", 1, "Hemlig låt", {published: false, listed: false, navidromeId: null}),
        ],
        starred: [],
        // Navidrome id of a song or album -> how often the listener played it and when last
        plays: {},
        // Navidrome id of a song or album -> the listener's rating, 1 to 5
        ratings: {},
        // Navidrome ids of starred albums
        starredAlbums: [],
        // The play queue shared with the listener's apps: Navidrome song ids, the current one and the position in ms
        playQueue: null,
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
const sortedKinds = () => [...state.kinds].sort((a, b) => a.position - b.position);
const kindOf = kindId => {
    const kind = state.kinds.find(candidate => candidate.id === kindId);

    return {...kind, isDefault: sortedKinds()[0]?.id === kindId};
};
const withCounts = (persona, album) => {
    const tracks = tracksOf(persona, album.id);

    return {...album, kind: kindOf(album.kindId), trackCount: tracks.length, durationMs: tracks.reduce((sum, t) => sum + t.durationMs, 0)};
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
        albums: visibleAlbums(persona).filter(album => album.published || filter?.includeUnpublished)
            .filter(album => !filter?.spexId || album.spex.some(spex => spex.id === filter.spexId || spex.parentId === filter.spexId))
            .map(album => withCounts(persona, album)),
        categories: [{id: uuidOf(1), name: "Chalmersspexet", albumCount: 1}],
        years: [1975],
    }),
    SpexAlbums: (persona, {filter}) => ({
        albums: visibleAlbums(persona).filter(album => album.published)
            .filter(album => album.spex.some(spex => spex.id === filter.spexId || spex.parentId === filter.spexId))
            .map(album => withCounts(persona, album)),
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
    Credits: (persona, {kind}) => {
        const counts = new Map();

        state.tracks.filter(t => t.listed).forEach(t => creditNames(t, kind).forEach(name => counts.set(name, (counts.get(name) ?? 0) + 1)));
        return {credits: [...counts].sort(([a], [b]) => a.localeCompare(b, "sv")).map(([name, trackCount]) => ({name, trackCount}))};
    },
    CreditTracks: (persona, {kind, name}) => ({
        creditTracks: state.tracks.filter(t => t.listed && creditNames(t, kind).some(candidate => candidate.toLowerCase() === name.toLowerCase())),
    }),
    Radio: (persona, {trackId, albumId, limit}) => {
        const listed = state.tracks.filter(t => t.listed);
        const seed = listed.filter(t => t.id === trackId);
        const rest = listed.filter(t => t.id !== trackId && t.albumId !== albumId);

        return {radio: [...seed, ...rest].slice(0, limit ?? 50)};
    },
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

        const spex = spexOf(input.spexIds);
        const album = {id: uuidOf(state.nextId++), title: input.title || spex[0]?.title, year: input.year ?? spex[0]?.year ?? null,
            kindId: input.kindId ?? sortedKinds()[0].id, description: input.description, hasCover: false, published: false, publishedAt: null,
            trashedAt: null, navidromeId: null, createdAt: new Date().toISOString(), lastModifiedAt: null,
            spex};

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
        return {spexSearch: SPEXREGISTER.map(({id, title, year, revival, parentId, categoryName}) => ({id, title, year, revival, parentId, categoryName}))};
    },
    MaintenanceJobs: persona => {
        requireAdmin(persona);
        return {maintenanceJobs: state.maintenanceJobs};
    },
    MaintenanceJobRun: (persona, {job}) => {
        requireAdmin(persona);
        const status = state.maintenanceJobs.find(j => j.job === job);

        if (!status || status.running) {
            return {maintenanceJobRun: false};
        }
        status.lastStartedAt = "2026-11-01T12:00:00Z";
        status.lastFinishedAt = "2026-11-01T12:00:01Z";
        status.lastSucceeded = true;
        return {maintenanceJobRun: true};
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

        album.spex = spexOf(input.spexIds);
        Object.assign(album, {title: input.title || album.title, year: input.year ?? album.year, kindId: input.kindId ?? album.kindId,
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
            albums: trashedAlbums.map(album => ({...album, kind: kindOf(album.kindId), trackCount: state.tracks.filter(t => t.albumId === album.id).length})),
            tracks: state.tracks.filter(t => t.trashedAt && !trashedAlbums.some(album => album.id === t.albumId)),
        }};
    },
    AuditLog: (persona, {page = 0, size = 50, filter = {}}) => {
        requireEditor(persona);

        const f = filter ?? {};
        const entries = state.audit
            .filter(entry => isAdmin(persona) ? !f.actorId || entry.actor === f.actorId : entry.actor === persona.sub)
            .filter(entry => (!f.entityType || entry.entityType === f.entityType) && (!f.action || entry.action === f.action)
                && (!f.entityId || entry.entityId === f.entityId) && (!f.q || entry.summary.toLowerCase().includes(f.q.toLowerCase()))
                && (!f.from || entry.at >= f.from) && (!f.to || entry.at < f.to))
            .map(entry => ({...entry, actorId: entry.actor}));

        return {auditLog: {entries: entries.slice(page * size, (page + 1) * size), totalCount: entries.length, page, size}};
    },
    AuditActors: persona => {
        requireEditor(persona);

        const actors = new Map(state.audit.filter(entry => isAdmin(persona) || entry.actor === persona.sub).map(entry => [entry.actor, entry.actorName]));

        return {auditActors: [...actors].map(([id, name]) => ({id, name}))};
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
    AlbumKinds: persona => {
        requireUser(persona);
        return {albumKinds: sortedKinds().map(kind => ({...kindOf(kind.id), albumCount: state.albums.filter(album => album.kindId === kind.id).length}))};
    },
    AlbumsByNavidromeIds: (persona, {ids}) => ({
        albumsByNavidromeIds: ids.map(id => state.albums.find(album => album.navidromeId === id && album.published && !album.trashedAt))
            .filter(Boolean).map(album => withCounts(persona, album)),
    }),
    AlbumKindCreate: (persona, {input}) => {
        requireAdmin(persona);

        const kind = {id: uuidOf(state.nextId++), nameSv: input.nameSv, nameEn: input.nameEn, position: state.kinds.length + 1};

        state.kinds.push(kind);
        return {albumKindCreate: {id: kind.id}};
    },
    AlbumKindUpdate: (persona, {id, input}) => {
        requireAdmin(persona);
        Object.assign(state.kinds.find(kind => kind.id === id), {nameSv: input.nameSv, nameEn: input.nameEn});
        return {albumKindUpdate: {id}};
    },
    AlbumKindsReorder: (persona, {ids}) => {
        requireAdmin(persona);
        ids.forEach((id, i) => state.kinds.find(kind => kind.id === id).position = i + 1);
        return {albumKindsReorder: ids.map(id => ({id}))};
    },
    AlbumKindDelete: (persona, {id}) => {
        requireAdmin(persona);

        const count = state.albums.filter(album => album.kindId === id).length;

        if (count > 0) {
            throw new GraphQLError("CONFLICT", `Albumsorten används av ${count} album och kan inte raderas.`);
        }
        state.kinds = state.kinds.filter(kind => kind.id !== id);
        return {albumKindDelete: null};
    },
    TracksByIds: (persona, {ids}) => ({
        tracksByIds: ids.map(id => state.tracks.find(t => t.id === id && t.listed)).filter(Boolean)
            .map(t => ({...t, spexId: state.albums.find(album => album.id === t.albumId)?.spex[0]?.id ?? null})),
    }),
};

function subsonic(res, payload) {
    res.writeHead(200, {"content-type": "application/json"}).end(JSON.stringify({"subsonic-response": {status: "ok", version: "1.16.1", ...payload}}));
}

const playlistOf = playlist => ({id: playlist.id, name: playlist.name, songCount: playlist.entries.length,
    duration: playlist.entries.length * 61, created: "2026-10-01T10:00:00Z", changed: "2026-10-01T10:00:00Z",
    comment: playlist.comment ?? "", owner: playlist.owner ?? "lisa", public: playlist.public ?? false, readonly: playlist.readonly ?? false});

const splitNames = value => value ? [...new Set(value.split(/\s*[,;/&]\s*/).map(name => name.trim()).filter(Boolean))] : [];

function creditNames(track, kind) {
    switch (kind) {
        case "PERFORMER":
            return splitNames(track.performers);
        case "LYRICS_AUTHOR":
            return splitNames(track.lyricsAuthor);
        case "ARRANGER":
            return splitNames(track.arranger);
        case "MELODY":
            return track.melody ? [track.melody] : [];
        default:
            return splitNames(/\(([^()]+)\)\s*$/.exec(track.melody ?? "")?.[1]);
    }
}

function handleRest(url, res) {
    const endpoint = url.pathname.slice("/rest/".length);
    const id = url.searchParams.get("id");

    const songOf = navidromeId => ({id: navidromeId, title: "", album: "", albumId: "",
        ...(state.plays[navidromeId] ? {playCount: state.plays[navidromeId].playCount, played: state.plays[navidromeId].played} : {}),
        ...(state.ratings[navidromeId] ? {userRating: state.ratings[navidromeId]} : {})});
    const albumIdParam = url.searchParams.get("albumId");

    if (endpoint === "scrobble") {
        if (url.searchParams.get("submission") === "true") {
            const track = state.tracks.find(t => t.navidromeId === id);
            const albumId = state.albums.find(album => album.id === track?.albumId)?.navidromeId;
            const now = new Date().toISOString();

            for (const played of [id, albumId].filter(Boolean)) {
                state.plays[played] = {playCount: (state.plays[played]?.playCount ?? 0) + 1, played: now};
            }
        }
        subsonic(res, {});
    } else if (endpoint === "getAlbum") {
        const album = state.albums.find(candidate => candidate.navidromeId === id);

        subsonic(res, {album: {id, ...(state.ratings[id] ? {userRating: state.ratings[id]} : {}),
            ...(state.starredAlbums.includes(id) ? {starred: "2026-10-31T18:00:00Z"} : {}), song: state.tracks.filter(t => t.albumId === album?.id && t.navidromeId).map(t => songOf(t.navidromeId))}});
    } else if (endpoint === "getAlbumList2" && url.searchParams.get("type") === "highest") {
        const rated = Object.entries(state.ratings)
            .filter(([navidromeId]) => state.albums.some(album => album.navidromeId === navidromeId))
            .sort(([, a], [, b]) => b - a);

        subsonic(res, {albumList2: {album: rated.map(([navidromeId, userRating]) => ({id: navidromeId, name: "", userRating}))}});
    } else if (endpoint === "setRating") {
        const rating = Number(url.searchParams.get("rating"));

        if (rating === 0) {
            delete state.ratings[id];
        } else {
            state.ratings[id] = rating;
        }
        subsonic(res, {});
    } else if (endpoint === "getPlayQueue") {
        subsonic(res, state.playQueue ? {playQueue: {current: state.playQueue.current, position: state.playQueue.position,
            username: "lisa", changed: "2026-10-31T18:00:00Z", changedBy: "Symfonium", entry: state.playQueue.ids.map(songOf)}} : {});
    } else if (endpoint === "savePlayQueue") {
        state.playQueue = {ids: url.searchParams.getAll("id"), current: url.searchParams.get("current"),
            position: Number(url.searchParams.get("position") ?? 0)};
        subsonic(res, {});
    } else if (endpoint === "getAlbumList2") {
        const played = Object.entries(state.plays)
            .filter(([navidromeId]) => state.albums.some(album => album.navidromeId === navidromeId))
            .sort(([, a], [, b]) => url.searchParams.get("type") === "frequent" ? b.playCount - a.playCount : b.played.localeCompare(a.played));

        subsonic(res, {albumList2: {album: played.map(([navidromeId, plays]) => ({id: navidromeId, name: "", ...plays}))}});
    } else if (endpoint === "getStarred2") {
        subsonic(res, {starred2: {song: state.starred.map(songOf), album: state.starredAlbums.map(navidromeId => ({id: navidromeId, name: ""}))}});
    } else if (endpoint === "star") {
        if (albumIdParam) {
            state.starredAlbums.push(albumIdParam);
        } else {
            state.starred.push(id);
        }
        subsonic(res, {});
    } else if (endpoint === "unstar") {
        if (albumIdParam) {
            state.starredAlbums = state.starredAlbums.filter(candidate => candidate !== albumIdParam);
        } else {
            state.starred = state.starred.filter(candidate => candidate !== id);
        }
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
        subsonic(res, {playlist: {...playlistOf(playlist), entry: playlist.entries.map(songOf)}});
    } else if (endpoint === "createPlaylist") {
        const existing = state.playlists.find(candidate => candidate.id === url.searchParams.get("playlistId"));

        if (existing) {
            existing.entries = url.searchParams.getAll("songId");
        } else {
            state.playlists.push({id: `pl-${state.nextId++}`, name: url.searchParams.get("name"), entries: url.searchParams.getAll("songId")});
        }
        subsonic(res, {});
    } else if (endpoint === "updatePlaylist") {
        const playlist = state.playlists.find(candidate => candidate.id === url.searchParams.get("playlistId"));

        for (const key of ["name", "comment"]) {
            if (url.searchParams.has(key)) {
                playlist[key] = url.searchParams.get(key);
            }
        }
        if (url.searchParams.has("public")) {
            playlist.public = url.searchParams.get("public") === "true";
        }
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
        } else if (req.method === "POST" && path === "/__playQueue") {
            state.playQueue = JSON.parse(body).playQueue;
            res.writeHead(204).end();
        } else if (req.method === "POST" && path === "/__plays") {
            Object.assign(state.plays, JSON.parse(body).plays);
            res.writeHead(204).end();
        } else if (req.method === "POST" && path === "/__fail") {
            const {operation, classification} = JSON.parse(body);

            state.failNext.set(operation, classification);
            res.writeHead(204).end();
        } else if (req.method === "GET" && path === "/__state") {
            res.writeHead(200, {"content-type": "application/json"}).end(JSON.stringify({
                uploads: state.uploads.size, scanRequested: state.scanRequested, starred: state.starred, plays: state.plays,
                ratings: state.ratings, starredAlbums: state.starredAlbums, playQueue: state.playQueue,
                kinds: state.kinds,
                playlists: state.playlists,
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
        } else if (req.method === "GET" && /^\/api\/(tracks|albums)\/[^/]+\/(audio|download)\/link$/.test(path)) {
            // A signed link, as the server hands out; the mock does not check signatures
            const scope = path.slice("/api/".length, -"/link".length);

            res.writeHead(200, {"content-type": "application/json"})
                .end(JSON.stringify({url: `http://localhost:${PORT}/media/9999999999/signature/${scope}`, expiresAt: "2286-11-20T17:46:39Z"}));
        } else if (req.method === "GET" && /^\/media\/\d+\/[^/]+\/tracks\/[^/]+\/(audio|download)$/.test(path)) {
            res.writeHead(200, {"content-type": "audio/flac", "accept-ranges": "bytes"}).end(Buffer.alloc(16));
        } else if (req.method === "GET" && /^\/media\/\d+\/[^/]+\/albums\/[^/]+\/download$/.test(path)) {
            res.writeHead(200, {"content-type": "application/zip", "content-disposition": "attachment; filename=\"album.zip\""}).end(Buffer.alloc(22));
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
