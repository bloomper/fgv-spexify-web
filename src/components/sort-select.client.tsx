"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

/**
 * A choice of order for a list, kept in the address as {@code sort}; the first option is the default and leaves it out.
 */
export function SortSelect({ options, value, label }: {
  options: { value: string; label: string }[];
  value: string;
  label: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <NativeSelect size="sm" value={value} onChange={event => {
        const query = new URLSearchParams(params.toString());

        if (event.target.value === options[0]?.value) {
          query.delete("sort");
        } else {
          query.set("sort", event.target.value);
        }
        router.push(`${pathname}${query.size ? `?${query}` : ""}`);
      }}>
        {options.map(option => <NativeSelectOption key={option.value}
                                                   value={option.value}>{option.label}</NativeSelectOption>)}
      </NativeSelect>
    </label>
  );
}
