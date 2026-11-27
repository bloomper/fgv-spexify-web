"use client";

import { useTranslations } from "next-intl";
import { Dices, Radio } from "lucide-react";
import { CoverImage } from "@/components/album/cover-image.client";
import { useRadio } from "@/components/player/radio.client";

/**
 * Radio stations on a shelf: one at random, then one per album the user played, with tracks that go with it.
 */
export function RadioShelfItems({ albums }: { albums: { id: string; title: string }[] }) {
  const t = useTranslations("Home");
  const radio = useRadio();
  const tile =
    "group/card relative block aspect-square w-full overflow-hidden rounded-md shadow-md outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60";

  return (
    <>
      <li className="w-36 shrink-0 snap-start sm:w-44">
        <button
          type="button"
          className={tile}
          disabled={radio.pending}
          onClick={() => radio.start({})}
        >
          <span className="from-primary to-chart-4 text-primary-foreground flex size-full flex-col items-center justify-center gap-2 bg-gradient-to-br p-3 text-center">
            <Dices
              className="size-10"
              aria-hidden
            />
            <span className="text-sm font-semibold">{t("randomRadio")}</span>
          </span>
        </button>
        <div className="text-muted-foreground mt-2 text-xs">{t("randomRadioHint")}</div>
      </li>
      {albums.map((album) => (
        <li
          key={album.id}
          className="w-36 shrink-0 snap-start sm:w-44"
        >
          <button
            type="button"
            className={tile}
            disabled={radio.pending}
            onClick={() => radio.start({ albumId: album.id })}
            aria-label={t("radioFrom", { title: album.title })}
          >
            <CoverImage
              albumId={album.id}
              title=""
              className="size-full"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-white transition group-hover/card:bg-black/30">
              <Radio
                className="size-10"
                aria-hidden
              />
            </span>
          </button>
          <div className="mt-2 line-clamp-2 text-sm leading-tight font-semibold">
            {t("radioFrom", { title: album.title })}
          </div>
        </li>
      ))}
    </>
  );
}
