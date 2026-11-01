import {getTranslations} from "next-intl/server";
import {Badge} from "@/components/ui/badge";
import {getLibraryStatus} from "@/lib/admin/admin.server";
import {formatInstant} from "@/utils/format";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";
import {RescanButton} from "../admin-buttons.client";

export default async function LibraryPage() {
    return withPolicyPage(Policies.admin.requireAdmin, async () => {
        const t = await getTranslations("AdminLibrary");
        const status = await getLibraryStatus();

        return (
            <div className="max-w-2xl space-y-6 p-4 sm:p-6">
                <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
                <p className="text-sm text-muted-foreground">{t("text")}</p>
                {status && (
                    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 rounded-lg border p-4 text-sm">
                        <dt className="text-muted-foreground">{t("navidrome")}</dt>
                        <dd>{status.navidromeAvailable ? <Badge variant="secondary">{t("available")}</Badge> : <Badge variant="destructive">{t("unavailable")}</Badge>}</dd>
                        <dt className="text-muted-foreground">{t("scan")}</dt>
                        <dd>{status.scanning ? t("scanning") : status.scanPending ? t("pending") : t("idle")}</dd>
                        <dt className="text-muted-foreground">{t("lastScan")}</dt>
                        <dd>{status.lastScanAt ? formatInstant(status.lastScanAt) : "–"}</dd>
                        <dt className="text-muted-foreground">{t("tracks")}</dt>
                        <dd>{t("trackCounts", {listed: status.listedTrackCount, all: status.trackCount})}</dd>
                        {status.lastScanError && (<><dt className="text-muted-foreground">{t("error")}</dt><dd className="text-destructive">{status.lastScanError}</dd></>)}
                    </dl>
                )}
                <RescanButton/>
            </div>
        );
    });
}
