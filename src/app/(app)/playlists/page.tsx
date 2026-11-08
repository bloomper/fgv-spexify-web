import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ListMusic } from "lucide-react";
import { formatDuration } from "@/components/player/lyrics";
import { getPlaylists } from "@/lib/subsonic.server";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { DataEmpty } from "@/components/data-empty";

export default async function PlaylistsPage() {
  return withPolicyPage(Policies.app.requireAccess, async () => {
    const t = await getTranslations("Playlists");
    const playlists = await getPlaylists().catch(() => null);

    return (
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="max-w-prose text-sm text-muted-foreground">{t("text")}</p>
        {playlists === null && <p className="text-destructive">{t("unavailable")}</p>}
        {playlists?.length === 0 && <DataEmpty title={t("none")} description={null} />}
        {playlists && playlists.length > 0 && (
          <ul className="divide-y rounded-lg border">
            {playlists.map(playlist => (
              <li key={playlist.id}>
                <Link href={`/playlists/${playlist.id}`} className="flex items-center gap-3 px-3 py-3 hover:bg-accent">
                  <ListMusic className="size-5 text-muted-foreground" />
                  <span className="min-w-0 flex-1">
                                        <span className="block truncate font-medium">{playlist.name}</span>
                    {(playlist.public || playlist.readonly) && (
                      <span className="block truncate text-xs text-muted-foreground">
                                                {playlist.readonly && playlist.owner ? t("by", { owner: playlist.owner }) : t("public")}
                                            </span>
                    )}
                                    </span>
                  <span className="text-sm text-muted-foreground">
                                        {t("songs", { count: playlist.songCount })} · {formatDuration(playlist.duration)}
                                    </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  });
}
