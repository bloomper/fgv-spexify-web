"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import type { AlbumInput } from "@/gql/graphql";
import { type PickedSpex, SpexPicker } from "@/components/spex/spex-picker.client";
import { type KindName, kindName } from "@/utils/format";

export type KindOption = KindName & { id: string };

/**
 * An album's fields. Its spex are searched in Spexipedia, or it is marked as not about any; the title and year
 * default to the main spex's. The albums are FGV's discography: a released record also has its catalogue number,
 * medium, dates and conductor.
 */
export function AlbumForm({ kinds, media = [], initial, submitLabel, onSubmit }: {
  /** The album kinds in order; the first is the default. */
  kinds: KindOption[];
  /** The album media (LP, EP, CD …) in order; an album that was never released has none. */
  media?: KindOption[];
  initial?: {
    spex?: PickedSpex[] | null;
    title: string;
    year?: number | null;
    kindId: string;
    description?: string | null;
    catalogueNumber?: string | null;
    mediumId?: string | null;
    released?: string | null;
    recorded?: string | null;
    conductor?: string | null;
  };
  submitLabel: string;
  onSubmit: (input: AlbumInput) => Promise<boolean>;
}) {
  const t = useTranslations("Manage");
  const locale = useLocale();
  const [spex, setSpex] = useState<PickedSpex[]>(initial?.spex ?? []);
  const [none, setNone] = useState(initial !== undefined && (initial.spex ?? []).length === 0);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [year, setYear] = useState(initial?.year ? String(initial.year) : "");
  const [kindId, setKindId] = useState(initial?.kindId ?? kinds[0]?.id ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [catalogueNumber, setCatalogueNumber] = useState(initial?.catalogueNumber ?? "");
  const [mediumId, setMediumId] = useState(initial?.mediumId ?? "");
  const [released, setReleased] = useState(initial?.released ?? "");
  const [recorded, setRecorded] = useState(initial?.recorded ?? "");
  const [conductor, setConductor] = useState(initial?.conductor ?? "");
  const [pending, startTransition] = useTransition();
  const main = spex[0];

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      await onSubmit({
        spexIds: spex.map(item => item.id),
        title: title.trim() || null,
        year: year ? Number(year) : null,
        kindId: kindId || null,
        description: description.trim() || null,
        catalogueNumber: catalogueNumber.trim() || null,
        mediumId: mediumId || null,
        released: released.trim() || null,
        recorded: recorded.trim() || null,
        conductor: conductor.trim() || null,
      });
    });
  };

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-4">
      <SpexPicker value={spex} onChange={setSpex} none={none} onNoneChange={setNone} />
      <div className="grid gap-4 sm:grid-cols-[1fr_8rem_12rem]">
        <div className="space-y-1.5">
          <Label htmlFor="title">{t("title")}</Label>
          <Input id="title" value={title} maxLength={255} required={none} placeholder={main?.title ?? ""}
                 onChange={event => setTitle(event.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="year">{t("year")}</Label>
          <Input id="year" inputMode="numeric" pattern="\d{4}" value={year}
                 placeholder={main?.year ? String(main.year) : ""}
                 onChange={event => setYear(event.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="kind">{t("kind")}</Label>
          <NativeSelect id="kind" value={kindId} onChange={event => setKindId(event.target.value)}>
            {kinds.map(kind => <NativeSelectOption key={kind.id}
                                                   value={kind.id}>{kindName(kind, locale)}</NativeSelectOption>)}
          </NativeSelect>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="description">{t("description")}</Label>
        <Textarea id="description" rows={4} value={description}
                  onChange={event => setDescription(event.target.value)} />
      </div>
      <fieldset className="space-y-3 rounded-lg border p-3">
        <legend className="px-1 text-sm font-medium">{t("discography")}</legend>
        <p className="text-xs text-muted-foreground">{t("discographyHelp")}</p>
        <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
          <div className="space-y-1.5">
            <Label htmlFor="catalogue-number">{t("catalogueNumber")}</Label>
            <Input id="catalogue-number" value={catalogueNumber} maxLength={50} placeholder="CEP 019"
                   onChange={event => setCatalogueNumber(event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="medium">{t("medium")}</Label>
            <NativeSelect id="medium" value={mediumId} onChange={event => setMediumId(event.target.value)}>
              <NativeSelectOption value="">{t("noMedium")}</NativeSelectOption>
              {media.map(medium => <NativeSelectOption key={medium.id}
                                                       value={medium.id}>{kindName(medium, locale)}</NativeSelectOption>)}
            </NativeSelect>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="released">{t("released")}</Label>
            <Input id="released" value={released} maxLength={10} placeholder="1987-04" pattern="\d{4}(-\d{2}(-\d{2})?)?"
                   onChange={event => setReleased(event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="recorded">{t("recorded")}</Label>
            <Input id="recorded" value={recorded} maxLength={10} placeholder="1987" pattern="\d{4}(-\d{2}(-\d{2})?)?"
                   onChange={event => setRecorded(event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="conductor">{t("conductor")}</Label>
            <Input id="conductor" value={conductor} maxLength={255}
                   onChange={event => setConductor(event.target.value)} />
          </div>
        </div>
      </fieldset>
      <Button type="submit" disabled={pending || (spex.length === 0 && !(none && title.trim()))}>{submitLabel}</Button>
    </form>
  );
}
