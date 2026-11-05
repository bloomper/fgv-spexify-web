/** The kinds of record Spexify's change log has. */
export const ENTITY_TYPES = ["ALBUM", "TRACK", "COLLECTION", "ALBUM_KIND", "SETTINGS", "USER"] as const;

/**
 * Where a record in the change log is edited; tracks have no page of their own.
 */
export function auditLink(entityType: string, entityId: string): string | null {
  switch (entityType) {
    case "ALBUM":
      return `/manage/albums/${entityId}`;
    case "COLLECTION":
      return `/manage/collections/${entityId}`;
    case "ALBUM_KIND":
      return "/admin/kinds";
    case "SETTINGS":
      return "/admin/settings";
    case "USER":
      return "/admin/users";
    default:
      return null;
  }
}
