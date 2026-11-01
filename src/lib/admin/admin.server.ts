import "server-only";

import {graphql} from "@/gql";
import {runMutation, runQuery} from "@/lib/graphql.server";
import type {SettingsInput} from "@/gql/graphql";

const UsersQuery = graphql(`
    query Users {
        users { id username displayName lastSeenAt appPasswordCount apiKeyCount locked }
    }
`);
const TrashQuery = graphql(`
    query Trash {
        trash {
            albums { id title year trashedAt trackCount }
            tracks { id title albumId albumTitle trashedAt }
        }
    }
`);
const LibraryStatusQuery = graphql(`
    query LibraryStatus {
        libraryStatus { navidromeAvailable scanning scanPending lastScanAt lastScanError trackCount listedTrackCount }
    }
`);
const AuditLogQuery = graphql(`
    query AuditLog($page: Int, $size: Int) {
        auditLog(page: $page, size: $size) {
            totalCount page size
            entries { id at actorName action entityType entityId summary }
        }
    }
`);
const SettingsQuery = graphql(`
    query Settings { settings { welcomeSv welcomeEn appPasswordExpiryMonths lockoutAttempts lockoutMinutes } }
`);

const UserCredentialsRevokeMutation = graphql(`mutation UserCredentialsRevoke($userId: ID!) { userCredentialsRevoke(userId: $userId) }`);
const UserUnlockMutation = graphql(`mutation UserUnlock($userId: ID!) { userUnlock(userId: $userId) }`);
const TrashEmptyMutation = graphql(`mutation TrashEmpty { trashEmpty }`);
const LibraryRescanMutation = graphql(`mutation LibraryRescan { libraryRescan }`);
const SettingsUpdateMutation = graphql(`
    mutation SettingsUpdate($input: SettingsInput!) { settingsUpdate(input: $input) { welcomeSv } }
`);

export const getUsers = async () => (await runQuery(UsersQuery, {}))?.users ?? [];
export const getTrash = async () => (await runQuery(TrashQuery, {}))?.trash;
export const getLibraryStatus = async () => (await runQuery(LibraryStatusQuery, {}))?.libraryStatus;
export const getAuditLog = async (page: number, size: number) => (await runQuery(AuditLogQuery, {page, size}))?.auditLog;
export const getSettings = async () => (await runQuery(SettingsQuery, {}))?.settings;
export const userCredentialsRevoke = (userId: string) => runMutation(UserCredentialsRevokeMutation, {userId});
export const userUnlock = (userId: string) => runMutation(UserUnlockMutation, {userId});
export const trashEmpty = () => runMutation(TrashEmptyMutation, {});
export const libraryRescan = () => runMutation(LibraryRescanMutation, {});
export const settingsUpdate = (input: SettingsInput) => runMutation(SettingsUpdateMutation, {input});
