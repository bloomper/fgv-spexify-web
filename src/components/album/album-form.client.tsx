"use client";

import * as React from "react";
import {useState, useTransition} from "react";
import {useLocale, useTranslations} from "next-intl";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {NativeSelect, NativeSelectOption} from "@/components/ui/native-select";
import type {AlbumInput} from "@/gql/graphql";
import {type PickedSpex, SpexPicker} from "@/components/spex/spex-picker.client";
import {type KindName, kindName} from "@/utils/format";

export type KindOption = KindName & { id: string };

/**
 * An album's fields. Its spex are searched in Spexregister, or it is marked as not about any; the title and year
 * default to the main spex's.
 */
export function AlbumForm({kinds, initial, submitLabel, onSubmit}: {
    /** The album kinds in order; the first is the default. */
    kinds: KindOption[];
    initial?: { spex?: PickedSpex[] | null; title: string; year?: number | null; kindId: string; description?: string | null };
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
            });
        });
    };

    return (
        <form onSubmit={submit} className="max-w-2xl space-y-4">
            <SpexPicker value={spex} onChange={setSpex} none={none} onNoneChange={setNone}/>
            <div className="grid gap-4 sm:grid-cols-[1fr_8rem_12rem]">
                <div className="space-y-1.5">
                    <Label htmlFor="title">{t("title")}</Label>
                    <Input id="title" value={title} maxLength={255} required={none} placeholder={main?.title ?? ""} onChange={event => setTitle(event.target.value)}/>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="year">{t("year")}</Label>
                    <Input id="year" inputMode="numeric" pattern="\d{4}" value={year} placeholder={main?.year ? String(main.year) : ""}
                           onChange={event => setYear(event.target.value)}/>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="kind">{t("kind")}</Label>
                    <NativeSelect id="kind" value={kindId} onChange={event => setKindId(event.target.value)}>
                        {kinds.map(kind => <NativeSelectOption key={kind.id} value={kind.id}>{kindName(kind, locale)}</NativeSelectOption>)}
                    </NativeSelect>
                </div>
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="description">{t("description")}</Label>
                <Textarea id="description" rows={4} value={description} onChange={event => setDescription(event.target.value)}/>
            </div>
            <Button type="submit" disabled={pending || (spex.length === 0 && !(none && title.trim()))}>{submitLabel}</Button>
        </form>
    );
}
