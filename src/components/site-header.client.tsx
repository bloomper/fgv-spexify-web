"use client";

import { SiteHeader as FgvSiteHeader } from "@bloomper/fgv-web-ui/shell/site-header";
import type { Application } from "@bloomper/fgv-web-ui/shell/applications";
import { LanguageToggle, ModeToggle } from "@bloomper/fgv-web-ui/shell/toggles";
import { HeaderSearch } from "@/components/header-search.client";

/**
 * The FGV header with this application's own controls.
 */
export function SiteHeader({ applications }: { applications: Application[] }) {
  return (
    <FgvSiteHeader
      applications={applications}
      actions={
        <>
          <HeaderSearch />
          <LanguageToggle />
          <ModeToggle />
        </>
      }
    />
  );
}
