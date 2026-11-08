"use client";

import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { useEffect, useRef } from "react";
import type { FieldError as RhfFieldError, Merge } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type HighlightsEditorProps = {
  value: string[];
  onChange: (value: string[]) => void;
  errors?: Merge<RhfFieldError, (RhfFieldError | undefined)[]>;
  max?: number;
};

/**
 * Edits a list of one-line highlights. Each row has its own label and error,
 * and buttons to reorder or remove it. Focus moves to the new input on add.
 */
export function HighlightsEditor({ value, onChange, errors, max = 10 }: HighlightsEditorProps) {
  const listRef = useRef<HTMLOListElement>(null);
  const focusNew = useRef(false);

  // Focus the input that was just added, once it exists in the DOM.
  useEffect(() => {
    if (!focusNew.current) return;
    focusNew.current = false;
    listRef.current?.querySelector<HTMLInputElement>("li:last-child input")?.focus();
  }, [value.length]);

  const update = (index: number, text: string) =>
    onChange(value.map((v, i) => (i === index ? text : v)));
  const remove = (index: number) => onChange(value.filter((_, i) => i !== index));
  const move = (index: number, by: -1 | 1) => {
    const next = [...value];
    const [item] = next.splice(index, 1);
    next.splice(index + by, 0, item ?? "");
    onChange(next);
  };
  const add = () => {
    focusNew.current = true;
    onChange([...value, ""]);
  };

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <ol ref={listRef} className="space-y-2">
          {value.map((text, index) => {
            const id = `highlight-${index}`;
            const error = Array.isArray(errors) ? errors[index] : undefined;
            return (
              <li key={index} className="space-y-1">
                <div className="flex items-center gap-1">
                  <label htmlFor={id} className="sr-only">
                    Highlight {index + 1}
                  </label>
                  <Input
                    id={id}
                    value={text}
                    onChange={(e) => update(index, e.target.value)}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? `${id}-error` : undefined}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label={`Move highlight ${index + 1} up`}
                  >
                    <ArrowUp aria-hidden />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => move(index, 1)}
                    disabled={index === value.length - 1}
                    aria-label={`Move highlight ${index + 1} down`}
                  >
                    <ArrowDown aria-hidden />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => remove(index)}
                    aria-label={`Remove highlight ${index + 1}`}
                  >
                    <X aria-hidden />
                  </Button>
                </div>
                {error?.message && (
                  <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
                    {error.message}
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={add}
        disabled={value.length >= max}
      >
        <Plus aria-hidden /> Add highlight
      </Button>
    </div>
  );
}
