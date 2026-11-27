import { getTranslations } from "next-intl/server";
import { Badge } from "@bloomper/fgv-web-ui/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@bloomper/fgv-web-ui/ui/table";
import { getUsers } from "@/lib/admin/admin.server";
import { formatInstant } from "@/utils/format";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { UserButtons } from "../admin-buttons.client";
import { Page, PageHeader } from "@bloomper/fgv-web-ui/shell/page-header";

export default async function UsersPage() {
  return withPolicyPage(Policies.admin.requireAdmin, async () => {
    const t = await getTranslations("AdminUsers");
    const users = await getUsers();

    return (
      <Page variant="content">
        <PageHeader title={t("title")} description={t("text")}/>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("user")}</TableHead>
                <TableHead className="hidden sm:table-cell">{t("lastSeen")}</TableHead>
                <TableHead className="hidden sm:table-cell">{t("appPasswords")}</TableHead>
                <TableHead className="hidden sm:table-cell">{t("apiKeys")}</TableHead>
                <TableHead className="hidden sm:table-cell" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="whitespace-normal">
                    <div className="font-medium">{user.displayName ?? user.username}</div>
                    <div className="break-all text-xs text-muted-foreground">{user.username}</div>
                    {/* On a phone the other columns are hidden, so their figures are shown here */}
                    <div className="text-xs tabular-nums text-muted-foreground sm:hidden">
                      {formatInstant(user.lastSeenAt)} · {t("appPasswords")}: {user.appPasswordCount} · {t("apiKeys")}: {user.apiKeyCount}
                    </div>
                    {user.locked && <Badge variant="destructive">{t("locked")}</Badge>}
                    <div className="mt-2 sm:hidden [&>div]:justify-start">
                      <UserButtons id={user.id} username={user.username} locked={user.locked}
                                   credentials={user.appPasswordCount + user.apiKeyCount} />
                    </div>
                  </TableCell>
                  <TableCell
                    className="hidden whitespace-nowrap tabular-nums sm:table-cell">{formatInstant(user.lastSeenAt)}</TableCell>
                  <TableCell className="hidden tabular-nums sm:table-cell">{user.appPasswordCount}</TableCell>
                  <TableCell className="hidden tabular-nums sm:table-cell">{user.apiKeyCount}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <UserButtons id={user.id} username={user.username} locked={user.locked}
                                 credentials={user.appPasswordCount + user.apiKeyCount} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Page>
    );
  });
}
