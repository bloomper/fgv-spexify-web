"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { SettingsInput } from "@/gql/graphql";
import { saveSettingsAction } from "../actions.server";

export function SettingsForm({ initial }: { initial: SettingsInput }) {
  const t = useTranslations("AdminSettings");
  const [values, setValues] = useState(initial);
  const [pending, startTransition] = useTransition();
  const number = (key: "appPasswordExpiryMonths" | "lockoutAttempts" | "lockoutMinutes") => ({
    type: "number",
    value: String(values[key]),
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => setValues({
      ...values,
      [key]: Number(event.target.value),
    }),
  });

  return (
    <form className="max-w-2xl space-y-4" onSubmit={event => {
      event.preventDefault();
      startTransition(async () => {
        const result = await saveSettingsAction(values);

        if (result.ok) {
          toast.success(t("saved"));
        } else {
          toast.error(result.message);
        }
      });
    }}>
      <div className="space-y-1.5">
        <Label htmlFor="welcome-sv">{t("welcomeSv")}</Label>
        <Textarea id="welcome-sv" rows={3} value={values.welcomeSv ?? ""}
                  onChange={event => setValues({ ...values, welcomeSv: event.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="welcome-en">{t("welcomeEn")}</Label>
        <Textarea id="welcome-en" rows={3} value={values.welcomeEn ?? ""}
                  onChange={event => setValues({ ...values, welcomeEn: event.target.value })} />
      </div>
      {/* Labels can wrap to different heights; the fields line up at the bottom */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col justify-end gap-1.5"><Label htmlFor="expiry">{t("expiry")}</Label><Input
          id="expiry" min={1} max={120} {...number("appPasswordExpiryMonths")} /></div>
        <div className="flex flex-col justify-end gap-1.5"><Label htmlFor="attempts">{t("attempts")}</Label><Input
          id="attempts" min={3} max={1000} {...number("lockoutAttempts")} /></div>
        <div className="flex flex-col justify-end gap-1.5"><Label htmlFor="minutes">{t("minutes")}</Label><Input
          id="minutes" min={1} max={1440} {...number("lockoutMinutes")} /></div>
      </div>
      <Button type="submit" disabled={pending}>{t("save")}</Button>
    </form>
  );
}
