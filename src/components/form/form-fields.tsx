"use client";

import type { ComponentProps, ReactNode } from "react";
import type { FieldError as RhfFieldError, UseFormRegisterReturn } from "react-hook-form";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type BaseProps = {
  id: string;
  label: string;
  description?: ReactNode;
  error?: RhfFieldError;
  registration: UseFormRegisterReturn;
};

/** Wires label, description and error to the input with ids and ARIA attributes. */
function describedBy(id: string, description: unknown, error: unknown) {
  const ids = [description && `${id}-description`, error && `${id}-error`].filter(Boolean);
  return ids.length ? ids.join(" ") : undefined;
}

export function InputField({
  id,
  label,
  description,
  error,
  registration,
  ...inputProps
}: BaseProps & Omit<ComponentProps<typeof Input>, "id" | keyof UseFormRegisterReturn>) {
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(id, description, error)}
        {...inputProps}
        {...registration}
      />
      {description && <FieldDescription id={`${id}-description`}>{description}</FieldDescription>}
      <FieldError id={`${id}-error`} errors={[error]} />
    </Field>
  );
}

export function TextareaField({
  id,
  label,
  description,
  error,
  registration,
  ...textareaProps
}: BaseProps & Omit<ComponentProps<typeof Textarea>, "id" | keyof UseFormRegisterReturn>) {
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Textarea
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(id, description, error)}
        {...textareaProps}
        {...registration}
      />
      {description && <FieldDescription id={`${id}-description`}>{description}</FieldDescription>}
      <FieldError id={`${id}-error`} errors={[error]} />
    </Field>
  );
}

/** For register(): turns an empty or whitespace-only input into null. */
export const emptyToNull = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? null : value;

/** For register() on number inputs: empty becomes null, anything else a number. */
export const toNullableNumber = (value: unknown) =>
  value === "" || value === null || value === undefined ? null : Number(value);
