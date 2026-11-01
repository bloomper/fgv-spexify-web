import Link from "next/link";
import {getTranslations} from "next-intl/server";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {getAuditLog} from "@/lib/admin/admin.server";
import {formatInstant} from "@/utils/format";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";
import {isAdmin} from "@/utils/auth";

const SIZE = 50;

export default async function AuditPage({searchParams}: { searchParams: Promise<{ page?: string }> }) {
    return withPolicyPage(Policies.editor.requireEditor, async (authz) => {
        const t = await getTranslations("Audit");
        const requested = Number((await searchParams).page ?? "0");
        const page = Number.isInteger(requested) && requested >= 0 ? requested : 0;
        const log = await getAuditLog(page, SIZE);
        const pages = Math.max(1, Math.ceil((log?.totalCount ?? 0) / SIZE));

        return (
            <div className="space-y-6 p-4 sm:p-6">
                <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
                <p className="text-sm text-muted-foreground">{isAdmin(authz.roles) ? t("textAdmin") : t("text")}</p>
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t("when")}</TableHead>
                                <TableHead>{t("who")}</TableHead>
                                <TableHead>{t("what")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {log?.entries.map(entry => (
                                <TableRow key={entry.id}>
                                    <TableCell className="whitespace-nowrap tabular-nums">{formatInstant(entry.at)}</TableCell>
                                    <TableCell>{entry.actorName}</TableCell>
                                    <TableCell>{entry.summary}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <nav className="flex items-center gap-3 text-sm" aria-label={t("pages")}>
                    {page > 0 && <Link href={`/manage/audit?page=${page - 1}`} className="text-primary hover:underline">{t("newer")}</Link>}
                    <span className="text-muted-foreground">{t("pageOf", {page: page + 1, pages})}</span>
                    {page + 1 < pages && <Link href={`/manage/audit?page=${page + 1}`} className="text-primary hover:underline">{t("older")}</Link>}
                </nav>
            </div>
        );
    });
}
