"use client";

import * as React from "react";
import {useEffect, useState, useTransition} from "react";
import {useTranslations} from "next-intl";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {NativeSelect, NativeSelectOption} from "@/components/ui/native-select";
import type {AlbumInput, AlbumKind} from "@/gql/graphql";
import {searchSpexAction} from "@/app/(app)/manage/actions.server";

type Spex = { id: string; title?: string | null; year?: number | null; revival: boolean; categoryName?: string | null };

const KINDS: AlbumKind[] = ["SHOW", "STUDIO", "COMPILATION", "OTHER"];

/**
 * An album's fields. The spex is searched in Spexregister; the title and year default to the spex's.
 */
export function AlbumForm({initial, submitLabel, onSubmit}: {
    initial?: { spex?: Spex | null; title: string; year?: number | null; kind: AlbumKind; description?: string | null };
    submitLabel: string;
    onSubmit: (input: AlbumInput) => Promise<boolean>;
}) {
    const t = useTranslations("Manage");
    const ta = useTranslations("Album");
    const [spex, setSpex] = useState<Spex | null>(initial?.spex ?? null);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Spex[]>([]);
    const [title, setTitle] = useState(initial?.title ?? "");
    const [year, setYear] = useState(initial?.year ? String(initial.year) : "");
    const [kind, setKind] = useState<AlbumKind>(initial?.kind ?? "SHOW");
    const [description, setDescription] = useState(initial?.description ?? "");
    const [pending, startTransition] = useTransition();
    const [searching, startSearch] = useTransition();

    useEffect(() => {
        if (query.trim().length < 2) {
            return;
        }

        const timer = setTimeout(() => startSearch(async () => {
            const result = await searchSpexAction(query);

            if (result.ok) {
                setResults(result.data);
            } else {
                toast.error(result.message);
            }
        }), 300);

        return () => clearTimeout(timer);
    }, [query]);

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        startTransition(async () => {
            await onSubmit({
                spexId: spex?.id ?? null,
                title: title.trim() || null,
                year: year ? Number(year) : null,
                kind,
                description: description.trim() || null,
            });
        });
    };

    return (
        <form onSubmit={submit} className="max-w-2xl space-y-4">
            <div className="space-y-1.5">
                <Label htmlFor="spex-search">{t("spex")}</Label>
                {spex ? (
                    <div className="flex items-center justify-between gap-2 rounded-md border px-3 py-2">
                        <span>{spex.title} {spex.year}{spex.revival ? ` (${ta("revival").toLowerCase()})` : ""}
                            {spex.categoryName && <span className="text-muted-foreground"> · {spex.categoryName}</span>}</span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setSpex(null)}>{t("change")}</Button>
                    </div>
                ) : (
                    <div className="space-y-1">
                        <Input id="spex-search" value={query} placeholder={t("spexSearch")} onChange={event => setQuery(event.target.value)}/>
                        <p className="text-xs text-muted-foreground">{searching ? t("searching") : t("spexHint")}</p>
                        {results.length > 0 && query.trim().length >= 2 && (
                            <ul className="max-h-60 divide-y overflow-y-auto rounded-md border">
                                {results.map(item => (
                                    <li key={item.id}>
                                        <button type="button" className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                                                onClick={() => {
                                                    setSpex(item);
                                                    setResults([]);
                                                    setQuery("");
                                                }}>
                                            {item.title} {item.year}{item.revival ? ` (${ta("revival").toLowerCase()})` : ""}
                                            {item.categoryName && <span className="text-muted-foreground"> · {item.categoryName}</span>}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>
            <div className="grid gap-4 sm:grid-cols-[1fr_8rem_12rem]">
                <div className="space-y-1.5">
                    <Label htmlFor="title">{t("title")}</Label>
                    <Input id="title" value={title} maxLength={255} placeholder={spex?.title ?? ""} onChange={event => setTitle(event.target.value)}/>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="year">{t("year")}</Label>
                    <Input id="year" inputMode="numeric" pattern="\d{4}" value={year} placeholder={spex?.year ? String(spex.year) : ""}
                           onChange={event => setYear(event.target.value)}/>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="kind">{t("kind")}</Label>
                    <NativeSelect id="kind" value={kind} onChange={event => setKind(event.target.value as AlbumKind)}>
                        {KINDS.map(value => <NativeSelectOption key={value} value={value}>{ta(`kind.${value}`)}</NativeSelectOption>)}
                    </NativeSelect>
                </div>
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="description">{t("description")}</Label>
                <Textarea id="description" rows={4} value={description} onChange={event => setDescription(event.target.value)}/>
            </div>
            <Button type="submit" disabled={pending || (!spex && !title.trim())}>{submitLabel}</Button>
        </form>
    );
}
