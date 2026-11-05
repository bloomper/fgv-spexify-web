"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import type { CollectionInput } from "@/gql/graphql";

export type CollectionAlbumOption = { id: string; title: string; year?: number | null; published: boolean };

type Props = {
  initial?: { title: string; description?: string | null; albumIds: string[] };
  albums: CollectionAlbumOption[];
  submitLabel: string;
  /** Resolves true when saved. */
  onSubmit: (input: CollectionInput) => Promise<boolean>;
};

/**
 * A collection's title, description and albums, in their order. Albums are added from a list of all albums not in the
 * trash, and moved or removed in place.
 */
export function CollectionForm({ initial, albums, submitLabel, onSubmit }: Props) {
  const t = useTranslations("Collections");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [ids, setIds] = useState<string[]>(initial?.albumIds ?? []);
  const [adding, setAdding] = useState("");
  const [pending, startTransition] = useTransition();
  const byId = new Map(albums.map(album => [album.id, album]));
  const available = albums.filter(album => !ids.includes(album.id));
  const label = (album: CollectionAlbumOption | undefined) => album ? [album.title, album.year].filter(Boolean).join(", ") : "?";

  const move = (from: number, to: number) => setIds(current => {
    const copy = [...current];
    const [moved] = copy.splice(from, 1);

    copy.splice(to, 0, moved);
    return copy;
  });

  return (
    <form className="max-w-2xl space-y-5" onSubmit={event => {
      event.preventDefault();
      startTransition(async () => {
        await onSubmit({ title: title.trim(), description: description.trim() || null, albumIds: ids });
      });
    }}>
      <div className="space-y-1.5">
        <Label htmlFor="collection-title">{t("titleLabel")}</Label>
        <Input id="collection-title" value={title} onChange={event => setTitle(event.target.value)} required
               maxLength={255} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="collection-description">{t("descriptionLabel")}</Label>
        <Textarea id="collection-description" rows={3} value={description}
                  onChange={event => setDescription(event.target.value)} maxLength={4000} />
      </div>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">{t("albumsLabel")}</legend>
        {ids.length === 0 ? <p className="text-sm text-muted-foreground">{t("noAlbums")}</p> : (
          <ol className="divide-y rounded-lg border">
            {ids.map((id, i) => {
              const album = byId.get(id);

              return (
                <li key={id} className="flex items-center gap-2 px-3 py-1.5">
                  <span className="w-6 text-right text-xs tabular-nums text-muted-foreground">{i + 1}</span>
                  <span className="min-w-0 flex-1 truncate text-sm">
                                        {label(album)}{album && !album.published &&
                    <span className="text-muted-foreground"> · {t("unpublished")}</span>}
                                    </span>
                  <Button type="button" variant="ghost" size="icon-sm" disabled={i === 0} onClick={() => move(i, i - 1)}
                          aria-label={t("moveUp", { title: label(album) })}><ArrowUp /></Button>
                  <Button type="button" variant="ghost" size="icon-sm" disabled={i === ids.length - 1}
                          onClick={() => move(i, i + 1)}
                          aria-label={t("moveDown", { title: label(album) })}><ArrowDown /></Button>
                  <Button type="button" variant="ghost" size="icon-sm"
                          onClick={() => setIds(current => current.filter(candidate => candidate !== id))}
                          aria-label={t("remove", { title: label(album) })}><X /></Button>
                </li>
              );
            })}
          </ol>
        )}
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-0 flex-1 space-y-1.5">
            <Label htmlFor="collection-add">{t("addAlbum")}</Label>
            <NativeSelect id="collection-add" value={adding} onChange={event => setAdding(event.target.value)}
                          className="w-full">
              <NativeSelectOption value="">{t("chooseAlbum")}</NativeSelectOption>
              {available.map(album => <NativeSelectOption key={album.id}
                                                          value={album.id}>{label(album)}</NativeSelectOption>)}
            </NativeSelect>
          </div>
          <Button type="button" variant="outline" disabled={!adding} onClick={() => {
            setIds(current => [...current, adding]);
            setAdding("");
          }}>
            <Plus />{t("add")}
          </Button>
        </div>
      </fieldset>
      <Button type="submit" disabled={pending || !title.trim()}>{submitLabel}</Button>
    </form>
  );
}
