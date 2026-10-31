import {getTranslations} from "next-intl/server";
import {Badge} from "@/components/ui/badge";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {getUsers} from "@/lib/admin/admin.server";
import {formatInstant} from "@/utils/format";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";
import {UserButtons} from "../admin-buttons.client";

export default async function UsersPage() {
    return withPolicyPage(Policies.admin.requireAdmin, async () => {
        const t = await getTranslations("AdminUsers");
        const users = await getUsers();

        return (
            <div className="space-y-6 p-4 sm:p-6">
                <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
                <p className="max-w-prose text-sm text-muted-foreground">{t("text")}</p>
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t("user")}</TableHead>
                                <TableHead>{t("lastSeen")}</TableHead>
                                <TableHead>{t("appPasswords")}</TableHead>
                                <TableHead>{t("apiKeys")}</TableHead>
                                <TableHead/>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="font-medium">{user.displayName ?? user.username}</div>
                                        <div className="text-xs text-muted-foreground">{user.username}</div>
                                        {user.locked && <Badge variant="destructive">{t("locked")}</Badge>}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap tabular-nums">{formatInstant(user.lastSeenAt)}</TableCell>
                                    <TableCell className="tabular-nums">{user.appPasswordCount}</TableCell>
                                    <TableCell className="tabular-nums">{user.apiKeyCount}</TableCell>
                                    <TableCell>
                                        <UserButtons id={user.id} username={user.username} locked={user.locked}
                                                     credentials={user.appPasswordCount + user.apiKeyCount}/>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        );
    });
}
