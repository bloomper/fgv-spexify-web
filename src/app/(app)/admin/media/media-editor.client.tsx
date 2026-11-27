"use client";

import { type EditableKind, KindsEditor } from "../kinds/kinds-editor.client";
import { createMediumAction, deleteMediumAction, reorderMediaAction, updateMediumAction } from "../actions.server";

const MEDIA_ACTIONS = {
  create: createMediumAction,
  update: updateMediumAction,
  reorder: reorderMediaAction,
  remove: deleteMediumAction,
  allowNone: true,
};

/**
 * The album media, edited as the album kinds are.
 */
export function MediaEditor({ media }: { media: EditableKind[] }) {
  return (
    <KindsEditor
      kinds={media}
      actions={MEDIA_ACTIONS}
    />
  );
}
