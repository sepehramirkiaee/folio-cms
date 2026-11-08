"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

type Props = { value: string; onChange: (value: string) => void; label: string };

/** Search box that updates the table after the user pauses typing. */
export function DataTableSearch({ value, onChange, label }: Props) {
  const [draft, setDraft] = useState(value);
  const debounced = useDebouncedValue(draft);

  useEffect(() => {
    if (debounced !== value) onChange(debounced);
    // Only react to the debounced draft, not to external value changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <div className="relative w-full sm:max-w-xs">
      <Search
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="search"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={label}
        aria-label={label}
        className="pl-8"
      />
    </div>
  );
}
