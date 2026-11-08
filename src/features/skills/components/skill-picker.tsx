"use client";

import { ChevronsUpDown, X } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSkillOptions } from "../hooks/use-skills";
import { SKILL_CATEGORY_LABELS, type SkillOption } from "../schemas/skill";

type SkillPickerProps = {
  id: string;
  value: string[];
  onChange: (ids: string[]) => void;
  onBlur?: () => void;
  invalid?: boolean;
  describedBy?: string;
};

/**
 * Multi-select for skills: a button opens a filterable checkbox list grouped
 * by category, and the selection shows as removable badges. Plain checkboxes
 * keep it fully keyboard and screen reader friendly.
 */
export function SkillPicker({
  id,
  value,
  onChange,
  onBlur,
  invalid,
  describedBy,
}: SkillPickerProps) {
  const { data: options = [], isPending, isError } = useSkillOptions();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const listId = useId();

  const byId = useMemo(() => new Map(options.map((o) => [o.id, o])), [options]);
  const selected = value.map((v) => byId.get(v)).filter((o): o is SkillOption => Boolean(o));

  const groups = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    const map = new Map<SkillOption["category"], SkillOption[]>();
    for (const option of options) {
      if (needle && !option.name.toLowerCase().includes(needle)) continue;
      map.set(option.category, [...(map.get(option.category) ?? []), option]);
    }
    return [...map.entries()];
  }, [options, filter]);

  const toggle = (skillId: string, checked: boolean) =>
    onChange(checked ? [...value, skillId] : value.filter((v) => v !== skillId));

  return (
    <div className="space-y-2">
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) onBlur?.();
        }}
      >
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            aria-invalid={invalid}
            aria-describedby={describedBy}
            aria-haspopup="dialog"
            className="w-full justify-between font-normal"
          >
            {value.length ? `${value.length} selected` : "Select skills"}
            <ChevronsUpDown className="opacity-50" aria-hidden />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-(--radix-popover-trigger-width) min-w-64 p-0" align="start">
          <div className="border-b p-2">
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter skills"
              aria-label="Filter skills"
              aria-controls={listId}
            />
          </div>
          <div id={listId} className="max-h-72 overflow-y-auto p-2">
            {isPending ? (
              <p className="p-2 text-sm text-muted-foreground">Loading skills...</p>
            ) : isError ? (
              <p className="p-2 text-sm text-destructive">Could not load skills.</p>
            ) : groups.length === 0 ? (
              <p className="p-2 text-sm text-muted-foreground">No skills match.</p>
            ) : (
              groups.map(([category, items]) => (
                <fieldset key={category} className="mb-2 last:mb-0">
                  <legend className="px-2 py-1 text-xs font-medium text-muted-foreground">
                    {SKILL_CATEGORY_LABELS[category]}
                  </legend>
                  {items.map((option) => {
                    const checkboxId = `${listId}-${option.id}`;
                    return (
                      <label
                        key={option.id}
                        htmlFor={checkboxId}
                        className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent"
                      >
                        <Checkbox
                          id={checkboxId}
                          checked={value.includes(option.id)}
                          onCheckedChange={(checked) => toggle(option.id, checked === true)}
                        />
                        {option.name}
                      </label>
                    );
                  })}
                </fieldset>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>

      {selected.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Selected skills">
          {selected.map((skill) => (
            <li key={skill.id}>
              <Badge variant="secondary" className="gap-1 pr-1">
                {skill.name}
                <button
                  type="button"
                  onClick={() => toggle(skill.id, false)}
                  aria-label={`Remove ${skill.name}`}
                  className="rounded-full p-0.5 outline-none hover:bg-muted-foreground/20 focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X className="size-3" aria-hidden />
                </button>
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
