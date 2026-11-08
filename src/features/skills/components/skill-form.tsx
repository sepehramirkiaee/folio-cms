"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { applyServerErrors } from "@/lib/forms/apply-server-errors";
import { useCreateSkill, useUpdateSkill } from "../hooks/use-skills";
import {
  SKILL_CATEGORY_LABELS,
  skillCategories,
  skillInputSchema,
  type SkillInput,
  type SkillRow,
} from "../schemas/skill";

type SkillFormProps = {
  skill?: SkillRow;
  onDone: () => void;
  onCancel: () => void;
};

export function SkillForm({ skill, onDone, onCancel }: SkillFormProps) {
  const create = useCreateSkill();
  const update = useUpdateSkill(skill?.id ?? "");
  const mutation = skill ? update : create;

  const form = useForm<SkillInput>({
    resolver: zodResolver(skillInputSchema),
    defaultValues: {
      name: skill?.name ?? "",
      category: skill?.category,
      featured: skill?.featured ?? true,
    },
  });
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit((values) =>
    mutation.mutate(values, {
      onSuccess: (saved) => {
        toast.success(skill ? `Saved ${saved.name}` : `Added ${saved.name}`);
        onDone();
      },
      onError: (error) => {
        if (!applyServerErrors(error, form.setError)) toast.error(error.message);
      },
    }),
  );

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <Field data-invalid={Boolean(errors.name)}>
          <FieldLabel htmlFor="skill-name">Name</FieldLabel>
          <Input
            id="skill-name"
            autoComplete="off"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "skill-name-error" : undefined}
            {...form.register("name")}
          />
          <FieldError id="skill-name-error" errors={[errors.name]} />
        </Field>

        <Controller
          control={form.control}
          name="category"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="skill-category">Category</FieldLabel>
              <Select name={field.name} value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger
                  id="skill-category"
                  ref={field.ref}
                  onBlur={field.onBlur}
                  aria-invalid={fieldState.invalid}
                  aria-describedby={fieldState.error ? "skill-category-error" : undefined}
                >
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {skillCategories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {SKILL_CATEGORY_LABELS[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError id="skill-category-error" errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="featured"
          render={({ field }) => (
            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor="skill-featured">Show on the public site</FieldLabel>
                <FieldDescription>Listed in the skills section of the home page.</FieldDescription>
              </FieldContent>
              <Switch
                id="skill-featured"
                ref={field.ref}
                checked={field.value}
                onCheckedChange={field.onChange}
                onBlur={field.onBlur}
              />
            </Field>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="animate-spin" aria-hidden />}
            {skill ? "Save changes" : "Add skill"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
