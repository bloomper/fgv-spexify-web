"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { rescanAction, revokeCredentialsAction, unlockAction } from "./actions.server";
import { useDialogs } from "@/components/dialogs.client";

function useRun() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return {
    pending,
    run: (work: () => Promise<{ ok: boolean; message?: string }>, success: string) => startTransition(async () => {
      const result = await work();

      if (result.ok) {
        toast.success(success);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    }),
  };
}

export function RescanButton() {
  const t = useTranslations("AdminLibrary");
  const { pending, run } = useRun();

  return <Button disabled={pending} onClick={() => run(rescanAction, t("rescanRequested"))}>{t("rescan")}</Button>;
}

export function UserButtons({ id, username, locked, credentials }: {
  id: string;
  username: string;
  locked: boolean;
  credentials: number
}) {
  const t = useTranslations("AdminUsers");
  const { confirm } = useDialogs();
  const { pending, run } = useRun();

  return (
    <div className="flex flex-wrap justify-end gap-2">
      {locked && <Button size="sm" variant="outline" disabled={pending}
                         onClick={() => run(() => unlockAction(id), t("unlocked"))}>{t("unlock")}</Button>}
      {credentials > 0 && (
        <Button size="sm" variant="destructive" disabled={pending} onClick={async () => {
          if (await confirm({
            title: t("confirmRevoke", { username }),
            confirmLabel: t("revokeAll"),
            destructive: true,
          })) {
            run(() => revokeCredentialsAction(id), t("revoked"));
          }
        }}>{t("revokeAll")}</Button>
      )}
    </div>
  );
}
