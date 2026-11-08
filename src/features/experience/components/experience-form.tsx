"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { History, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { emptyToNull, InputField, TextareaField } from "@/components/form/form-fields";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { SkillPicker } from "@/features/skills/components/skill-picker";
import { useFormDraft } from "@/hooks/use-form-draft";
import { applyServerErrors } from "@/lib/forms/apply-server-errors";
import { useCreateExperience, useUpdateExperience } from "../hooks/use-experience";
import {
  experienceInputSchema,
  type ExperienceDetail,
  type ExperienceInput,
} from "../schemas/experience";
import { HighlightsEditor } from "./highlights-editor";

const emptyEntry: ExperienceInput = {
  company: "",
  role: "",
  location: null,
  companyUrl: null,
  startDate: "",
  endDate: null,
  summary: "",
  highlights: [],
  skillIds: [],
};

function toFormValues({ id: _id, updatedAt: _u, ...values }: ExperienceDetail): ExperienceInput {
  return values;
}

const dateTime = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" });

export function ExperienceForm({ entry }: { entry?: ExperienceDetail }) {
  const router = useRouter();
  const create = useCreateExperience();
  const update = useUpdateExperience(entry?.id ?? "");
  const mutation = entry ? update : create;

  const form = useForm<ExperienceInput>({
    resolver: zodResolver(experienceInputSchema),
    defaultValues: entry ? toFormValues(entry) : emptyEntry,
  });
  const { errors, isDirty } = form.formState;
  const draft = useFormDraft(form, `experience:${entry?.id ?? "new"}`);
  const [current, setCurrent] = useState(entry ? entry.endDate === null : false);

  const onSubmit = form.handleSubmit((values) =>
    mutation.mutate(values, {
      onSuccess: (saved) => {
        draft.clear();
        if (entry) {
          form.reset(toFormValues(saved));
          toast.success("Experience saved");
        } else {
          toast.success(`Added ${saved.role} at ${saved.company}`);
          router.push("/admin/experience");
        }
      },
      onError: (error) => {
        if (!applyServerErrors(error, form.setError)) toast.error(error.message);
      },
    }),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-3xl space-y-6">
      {draft.draftSavedAt && (
        <Alert>
          <History aria-hidden />
          <AlertDescription className="flex flex-wrap items-center gap-3">
            <span>You have unsaved changes from {dateTime.format(draft.draftSavedAt)}.</span>
            <span className="flex gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  draft.restore();
                  setCurrent(form.getValues("endDate") === null);
                }}
              >
                Restore
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={draft.discard}>
                Discard
              </Button>
            </span>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent>
          <FieldGroup>
            <div className="grid gap-6 sm:grid-cols-2">
              <InputField
                id="role"
                label="Role"
                error={errors.role}
                registration={form.register("role")}
              />
              <InputField
                id="company"
                label="Company"
                error={errors.company}
                registration={form.register("company")}
              />
              <InputField
                id="location"
                label="Location"
                placeholder="Remote, or City, Country"
                error={errors.location}
                registration={form.register("location", { setValueAs: emptyToNull })}
              />
              <InputField
                id="companyUrl"
                label="Company website"
                type="url"
                placeholder="https://"
                error={errors.companyUrl}
                registration={form.register("companyUrl", { setValueAs: emptyToNull })}
              />
            </div>

            <FieldSet>
              <FieldLegend variant="label">Dates</FieldLegend>
              <div className="grid gap-6 sm:grid-cols-2">
                <InputField
                  id="startDate"
                  label="Start month"
                  type="month"
                  error={errors.startDate}
                  registration={form.register("startDate")}
                />
                <InputField
                  id="endDate"
                  label="End month"
                  type="month"
                  disabled={current}
                  error={errors.endDate}
                  registration={form.register("endDate", { setValueAs: emptyToNull })}
                />
              </div>
              <Field orientation="horizontal">
                <Checkbox
                  id="current"
                  checked={current}
                  onCheckedChange={(checked) => {
                    const isCurrent = checked === true;
                    setCurrent(isCurrent);
                    if (isCurrent) {
                      form.setValue("endDate", null, { shouldDirty: true });
                      form.clearErrors("endDate");
                    }
                  }}
                />
                <FieldLabel htmlFor="current">I currently work here</FieldLabel>
              </Field>
            </FieldSet>

            <TextareaField
              id="summary"
              label="Summary"
              rows={3}
              error={errors.summary}
              registration={form.register("summary")}
            />

            <Controller
              control={form.control}
              name="highlights"
              render={({ field, fieldState }) => (
                <FieldSet>
                  <FieldLegend variant="label">Highlights</FieldLegend>
                  <FieldDescription>
                    Short, concrete results. Shown as a bullet list.
                  </FieldDescription>
                  <HighlightsEditor
                    value={field.value}
                    onChange={field.onChange}
                    errors={errors.highlights}
                  />
                  <FieldError errors={[fieldState.error?.root ?? fieldState.error]} />
                </FieldSet>
              )}
            />

            <Controller
              control={form.control}
              name="skillIds"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="skills">Skills used</FieldLabel>
                  <SkillPicker
                    id="skills"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    invalid={fieldState.invalid}
                    describedBy={fieldState.error ? "skills-error" : undefined}
                  />
                  <FieldError id="skills-error" errors={[fieldState.error]} />
                </Field>
              )}
            />
          </FieldGroup>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/experience")}>
          {isDirty ? "Cancel" : "Back to experience"}
        </Button>
        <Button type="submit" disabled={mutation.isPending || (Boolean(entry) && !isDirty)}>
          {mutation.isPending && <Loader2 className="animate-spin" aria-hidden />}
          {entry ? "Save changes" : "Add experience"}
        </Button>
      </div>
    </form>
  );
}
