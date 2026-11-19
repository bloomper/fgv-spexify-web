import "server-only";

import { graphql } from "@/gql";
import { runMutation, runQuery } from "@/lib/graphql.server";
import type { ScoreSyncInput } from "@/gql/graphql";

export const ScoreSyncFieldsFragment = graphql(`
    fragment ScoreSyncFields on ScoreSync {
        fileId method status quality error stale updatedAt version
        points { seconds measure beat }
        jumps { after to nth }
    }
`);

const TrackStudioQuery = graphql(`
    query TrackStudio($id: ID!) {
        track(id: $id) {
            id
            sheetMusic {
                arrangementId archiveUrl
                versions {
                    id label arranger recommended key tempo
                    files { id title name extension contentType size pages roleSv roleEn instrumentsSv instrumentsEn desk kind }
                }
            }
            scoreSyncs { ...ScoreSyncFields }
            singers { label name }
        }
    }
`);

const LyricsEditorQuery = graphql(`
    query LyricsEditor($id: ID!, $points: Int!) {
        track(id: $id) {
            id albumId albumTitle title discNumber trackNumber durationMs lyrics lyricsSynced fileMissing
            lyricsRevisions { id lyrics synced createdAt createdBy }
            waveform(points: $points)
        }
    }
`);

const TrackLyricsUpdateMutation = graphql(`
    mutation TrackLyricsUpdate($id: ID!, $lyrics: String, $synced: Boolean!, $baseRevisionId: ID) {
        trackLyricsUpdate(id: $id, lyrics: $lyrics, synced: $synced, baseRevisionId: $baseRevisionId) {
            id lyrics lyricsSynced
            lyricsRevisions { id lyrics synced createdAt createdBy }
        }
    }
`);

const TrackLyricsRestoreMutation = graphql(`
    mutation TrackLyricsRestore($id: ID!, $revisionId: ID!) {
        trackLyricsRestore(id: $id, revisionId: $revisionId) {
            id lyrics lyricsSynced
            lyricsRevisions { id lyrics synced createdAt createdBy }
        }
    }
`);

const ScoreSyncSaveMutation = graphql(`
    mutation ScoreSyncSave($trackId: ID!, $fileId: ID!, $input: ScoreSyncInput!, $version: Float) {
        scoreSyncSave(trackId: $trackId, fileId: $fileId, input: $input, version: $version) { ...ScoreSyncFields }
    }
`);

const ScoreSyncDeleteMutation = graphql(`
    mutation ScoreSyncDelete($trackId: ID!, $fileId: ID!) {
        scoreSyncDelete(trackId: $trackId, fileId: $fileId)
    }
`);

const ScoreAlignMutation = graphql(`
    mutation ScoreAlign($trackId: ID!, $fileId: ID!) {
        scoreAlign(trackId: $trackId, fileId: $fileId) { ...ScoreSyncFields }
    }
`);


export async function getTrackStudio(id: string) {
  return (await runQuery(TrackStudioQuery, { id }))?.track ?? null;
}

export async function getLyricsEditor(id: string, points: number) {
  return (await runQuery(LyricsEditorQuery, { id, points }))?.track ?? null;
}

export async function trackLyricsUpdate(id: string, lyrics: string | null, synced: boolean, baseRevisionId: string | null) {
  return (await runMutation(TrackLyricsUpdateMutation, { id, lyrics, synced, baseRevisionId }))?.trackLyricsUpdate;
}

export async function trackLyricsRestore(id: string, revisionId: string) {
  return (await runMutation(TrackLyricsRestoreMutation, { id, revisionId }))?.trackLyricsRestore;
}

export async function scoreSyncSave(trackId: string, fileId: string, input: ScoreSyncInput, version: number | null) {
  return (await runMutation(ScoreSyncSaveMutation, { trackId, fileId, input, version }))?.scoreSyncSave;
}

export async function scoreSyncDelete(trackId: string, fileId: string) {
  return (await runMutation(ScoreSyncDeleteMutation, { trackId, fileId }))?.scoreSyncDelete ?? false;
}

export async function scoreAlign(trackId: string, fileId: string) {
  return (await runMutation(ScoreAlignMutation, { trackId, fileId }))?.scoreAlign;
}
