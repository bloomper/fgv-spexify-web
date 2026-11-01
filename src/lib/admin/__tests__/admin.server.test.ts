import {beforeEach, describe, expect, it, vi} from "vitest";
import * as admin from "@/lib/admin/admin.server";

const {runQuery, runMutation} = vi.hoisted(() => ({runQuery: vi.fn(), runMutation: vi.fn()}));

vi.mock("@/lib/graphql.server", () => ({runQuery, runMutation}));

describe("the admin client", () => {
    beforeEach(() => {
        runQuery.mockReset();
        runMutation.mockReset();
    });

    it("unwraps the query results", async () => {
        runQuery.mockResolvedValueOnce({users: [{id: "u1"}]});
        expect(await admin.getUsers()).toEqual([{id: "u1"}]);
        runQuery.mockResolvedValueOnce(undefined);
        expect(await admin.getUsers()).toEqual([]);

        runQuery.mockResolvedValueOnce({trash: {albums: [], tracks: []}});
        expect(await admin.getTrash()).toEqual({albums: [], tracks: []});

        runQuery.mockResolvedValueOnce({libraryStatus: {scanning: false}});
        expect(await admin.getLibraryStatus()).toEqual({scanning: false});

        runQuery.mockResolvedValueOnce({auditLog: {totalCount: 0}});
        expect(await admin.getAuditLog(2, 50)).toEqual({totalCount: 0});
        expect(runQuery.mock.calls.at(-1)?.[1]).toEqual({page: 2, size: 50});

        runQuery.mockResolvedValueOnce({settings: {lockoutMinutes: 15}});
        expect(await admin.getSettings()).toEqual({lockoutMinutes: 15});
    });

    it("sends the mutations' variables", async () => {
        runMutation.mockResolvedValue({});
        await admin.userCredentialsRevoke("u1");
        expect(runMutation.mock.calls.at(-1)?.[1]).toEqual({userId: "u1"});
        await admin.userUnlock("u2");
        expect(runMutation.mock.calls.at(-1)?.[1]).toEqual({userId: "u2"});
        await admin.trashEmpty();
        await admin.libraryRescan();
        await admin.settingsUpdate({lockoutMinutes: 5} as never);
        expect(runMutation.mock.calls.at(-1)?.[1]).toEqual({input: {lockoutMinutes: 5}});
        expect(runMutation).toHaveBeenCalledTimes(5);
    });
});
