"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { History, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import {
  emptyToNull,
  InputField,
  TextareaField,
  toNullableNumber,
} from "@/components/form/form-fields";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { SkillPicker } from "@/features/skills/components/skill-picker";
import { useFormDraft } from "@/hooks/use-form-draft";
import { applyServerErrors } from "@/lib/forms/apply-server-errors";
import { slugify } from "@/lib/slug";
import { useCreateProject, useUpdateProject } from "../hooks/use-projects";
import {
  PROJECT_STATUS_LABELS,
  projectInputSchema,
  projectStatuses,
  type ProjectDetail,
  type ProjectInput,
} from "../schemas/project";

const emptyProject: ProjectInput = {
  title: "",
  slug: "",
  summary: "",
  body: "",
  coverImageUrl: null,
  liveUrl: null,
  repoUrl: null,
  year: null,
  status: "DRAFT",
  featured: false,
  skillIds: [],
};

function toFormValues(project: ProjectDetail): ProjectInput {
  const { id: _id, sortOrder: _s, updatedAt: _u, ...values } = project;
  return values;
}

const dateTime = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" });

export function ProjectForm({ project }: { project?: ProjectDetail }) {
  const router = useRouter();
  const create = useCreateProject();
  const update = useUpdateProject(project?.id ?? "");
  const mutation = project ? update : create;

  const form = useForm<ProjectInput>({
    resolver: zodResolver(projectInputSchema),
    defaultValues: project ? toFormValues(project) : emptyProject,
  });
  const { errors, isDirty } = form.formState;
  const draft = useFormDraft(form, `project:${project?.id ?? "new"}`);

  const [title, slug, summary] = useWatch({
    control: form.control,
    name: ["title", "slug", "summary"],
  });

  const onSubmit = form.handleSubmit((values) =>
    mutation.mutate(values, {
      onSuccess: (saved) => {
        draft.clear();
        if (project) {
          form.reset(toFormValues(saved));
          toast.success("Project saved");
        } else {
          toast.success(`Created ${saved.title}`);
          router.push(`/admin/projects/${saved.id}`);
        }
      },
      onError: (error) => {
        if (!applyServerErrors(error, form.setError)) toast.error(error.message);
      },
    }),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      {draft.draftSavedAt && (
        <Alert>
          <History aria-hidden />
          <AlertDescription className="flex flex-wrap items-center gap-3">
            <span>You have unsaved changes from {dateTime.format(draft.draftSavedAt)}.</span>
            <span className="flex gap-2">
              <Button type="button" size="sm" onClick={draft.restore}>
                Restore
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={draft.discard}>
                Discard
              </Button>
            </span>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>Content</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <InputField
                id="title"
                label="Title"
                error={errors.title}
                registration={form.register("title")}
              />
              <InputField
                id="slug"
                label="URL slug"
                placeholder={slugify(title || "") || "generated-from-title"}
                description={`Used in the address: /projects/${slug || slugify(title || "") || "..."}. Leave empty to generate it from the title.`}
                error={errors.slug}
                registration={form.register("slug")}
              />
              <TextareaField
                id="summary"
                label="Summary"
                rows={3}
                description={`${summary?.length ?? 0} of 280 characters. Shown on project cards and in search results.`}
                error={errors.summary}
                registration={form.register("summary")}
              />
              <TextareaField
                id="body"
                label="Case study"
                rows={12}
                description="Plain text. Separate paragraphs with an empty line."
                error={errors.body}
                registration={form.register("body")}
              />
            </FieldGroup>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <h2>Publishing</h2>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Controller
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <Field>
                      <FieldLabel htmlFor="status">Status</FieldLabel>
                      <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="status" ref={field.ref} className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {projectStatuses.map((s) => (
                            <SelectItem key={s} value={s}>
                              {PROJECT_STATUS_LABELS[s]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldDescription>Drafts are only visible here.</FieldDescription>
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <Field orientation="horizontal">
                      <FieldContent>
                        <FieldLabel htmlFor="featured">Featured</FieldLabel>
                        <FieldDescription>Shown on the home page.</FieldDescription>
                      </FieldContent>
                      <Switch
                        id="featured"
                        ref={field.ref}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </Field>
                  )}
                />
                <InputField
                  id="year"
                  label="Year"
                  type="number"
                  inputMode="numeric"
                  error={errors.year}
                  registration={form.register("year", { setValueAs: toNullableNumber })}
                />
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <h2>Skills and links</h2>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Controller
                  control={form.control}
                  name="skillIds"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="skills">Skills</FieldLabel>
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
                <InputField
                  id="liveUrl"
                  label="Live URL"
                  type="url"
                  placeholder="https://"
                  error={errors.liveUrl}
                  registration={form.register("liveUrl", { setValueAs: emptyToNull })}
                />
                <InputField
                  id="repoUrl"
                  label="Repository URL"
                  type="url"
                  placeholder="https://"
                  error={errors.repoUrl}
                  registration={form.register("repoUrl", { setValueAs: emptyToNull })}
                />
                <InputField
                  id="coverImageUrl"
                  label="Cover image URL"
                  type="url"
                  placeholder="https://"
                  error={errors.coverImageUrl}
                  registration={form.register("coverImageUrl", { setValueAs: emptyToNull })}
                />
              </FieldGroup>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="sticky bottom-0 -mx-4 flex justify-end gap-2 border-t bg-background/95 px-4 py-3 md:-mx-8 md:px-8">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/projects")}>
          {isDirty ? "Cancel" : "Back to projects"}
        </Button>
        <Button type="submit" disabled={mutation.isPending || (Boolean(project) && !isDirty)}>
          {mutation.isPending && <Loader2 className="animate-spin" aria-hidden />}
          {project ? "Save changes" : "Create project"}
        </Button>
      </div>
    </form>
  );
}
