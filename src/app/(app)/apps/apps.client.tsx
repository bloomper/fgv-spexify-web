"use client";

import * as React from "react";
import { useId, useState, useTransition } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Copy, KeyRound, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  createApiKeyAction,
  createAppPasswordAction,
  revokeApiKeyAction,
  revokeAppPasswordAction,
} from "./actions.server";
import { track } from "@/utils/umami";
import { useDialogs } from "@/components/dialogs.client";

type Credential = {
  id: string;
  name: string;
  createdAt: string;
  lastUsedAt?: string | null;
  expiresAt?: string;
  expired?: boolean
};

function CopyField({ label, value }: { label: string; value: string }) {
  const t = useTranslations("Apps");
  const id = useId();

  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-2">
        <Input id={id} readOnly value={value} className="font-mono" onFocus={event => event.target.select()} />
        <Button type="button" variant="outline" size="icon" aria-label={t("copy", { what: label })}
                onClick={() => navigator.clipboard.writeText(value).then(() => toast.success(t("copied")))}>
          <Copy />
        </Button>
      </div>
    </div>
  );
}

/**
 * App passwords and API keys: created with a name, shown once, listed with when they were last used, and revoked.
 */
export function AppsManager({ serverUrl, username, passwords, apiKeys }: {
  serverUrl: string;
  username: string;
  passwords: Credential[];
  apiKeys: Credential[];
}) {
  const t = useTranslations("Apps");
  const { confirm } = useDialogs();
  const format = useFormatter();
  const [name, setName] = useState("");
  const [keyName, setKeyName] = useState("");
  const [created, setCreated] = useState<{ password?: string; key?: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const date = (value?: string | null) => value ? format.dateTime(new Date(value), { dateStyle: "medium" }) : t("never");

  const create = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const result = await createAppPasswordAction(name);

      if (result.ok && result.data) {
        setCreated({ password: result.data.password });
        track("app-password-create");
        setName("");
      } else if (!result.ok) {
        toast.error(result.message);
      }
    });
  };

  const createKey = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const result = await createApiKeyAction(keyName);

      if (result.ok && result.data) {
        setCreated({ key: result.data });
        track("api-key-create");
        setKeyName("");
      } else if (!result.ok) {
        toast.error(result.message);
      }
    });
  };

  const revoke = async (id: string, apiKey: boolean) => {
    if (!await confirm({ title: t("confirmRevoke"), destructive: true })) {
      return;
    }
    startTransition(async () => {
      const result = apiKey ? await revokeApiKeyAction(id) : await revokeAppPasswordAction(id);

      if (!result.ok) {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="space-y-8">
      <section className="space-y-3 rounded-lg border p-4">
        <h2 className="text-lg font-semibold">{t("connect")}</h2>
        <p className="text-sm text-muted-foreground">{t("connectText")}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <CopyField label={t("server")} value={serverUrl} />
          <CopyField label={t("username")} value={username} />
        </div>
      </section>

      {created && (
        <Alert>
          <KeyRound />
          <AlertTitle>{created.password ? t("createdPassword") : t("createdKey")}</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>{t("shownOnce")}</p>
            <CopyField label={created.password ? t("password") : t("apiKey")}
                       value={(created.password ?? created.key)!} />
            <Button variant="outline" onClick={() => setCreated(null)}>{t("done")}</Button>
          </AlertDescription>
        </Alert>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("passwords")}</h2>
        <form onSubmit={create} className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1">
            <Label htmlFor="app-name">{t("name")}</Label>
            <Input id="app-name" value={name} maxLength={100} required placeholder={t("namePlaceholder")}
                   onChange={event => setName(event.target.value)} />
          </div>
          <Button type="submit" disabled={pending || !name.trim()}>{t("create")}</Button>
        </form>
        {passwords.length === 0 ? <p className="text-sm text-muted-foreground">{t("noPasswords")}</p> : (
          <ul className="divide-y rounded-lg border">
            {passwords.map(password => (
              <li key={password.id} className="flex flex-wrap items-center gap-3 px-3 py-3">
                <Smartphone className="size-5 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{password.name} {password.expired &&
                    <Badge variant="destructive">{t("expired")}</Badge>}</div>
                  <div className="text-xs text-muted-foreground">
                    {t("created", { date: date(password.createdAt) })} · {t("lastUsed", { date: date(password.lastUsedAt) })}
                    {!password.expired && password.expiresAt && ` · ${t("expires", { date: date(password.expiresAt) })}`}
                  </div>
                </div>
                <Button variant="outline" size="sm" disabled={pending}
                        onClick={() => revoke(password.id, false)}>{t("revoke")}</Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("apiKeys")}</h2>
        <p className="text-sm text-muted-foreground">{t("apiKeysText")}</p>
        <form onSubmit={createKey} className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1">
            <Label htmlFor="key-name">{t("name")}</Label>
            <Input id="key-name" value={keyName} maxLength={100} required
                   onChange={event => setKeyName(event.target.value)} />
          </div>
          <Button type="submit" variant="outline" disabled={pending || !keyName.trim()}>{t("createKey")}</Button>
        </form>
        {apiKeys.length > 0 && (
          <ul className="divide-y rounded-lg border">
            {apiKeys.map(apiKey => (
              <li key={apiKey.id} className="flex flex-wrap items-center gap-3 px-3 py-3">
                <KeyRound className="size-5 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{apiKey.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {t("created", { date: date(apiKey.createdAt) })} · {t("lastUsed", { date: date(apiKey.lastUsedAt) })}
                  </div>
                </div>
                <Button variant="outline" size="sm" disabled={pending}
                        onClick={() => revoke(apiKey.id, true)}>{t("revoke")}</Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
