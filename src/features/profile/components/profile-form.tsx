"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { emptyToNull, InputField, TextareaField } from "@/components/form/form-fields";
import { PageHeader } from "@/components/layout/admin/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { applyServerErrors } from "@/lib/forms/apply-server-errors";
import { useProfile, useSaveProfile } from "../hooks/use-profile";
import { profileInputSchema, type Profile, type ProfileInput } from "../schemas/profile";

function toFormValues({ updatedAt: _u, ...values }: Profile): ProfileInput {
  return values;
}

export function ProfileSettings() {
  const { data, isPending, isError } = useProfile();
  return (
    <>
      <PageHeader
        title="Profile"
        description="The introduction and contact links at the top of your home page."
      />
      {isPending ? (
        <Skeleton className="h-96 max-w-3xl" />
      ) : isError ? (
        <p className="text-destructive">Could not load your profile.</p>
      ) : (
        <ProfileForm profile={data} />
      )}
    </>
  );
}

function ProfileForm({ profile }: { profile: Profile }) {
  const save = useSaveProfile();
  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileInputSchema),
    defaultValues: toFormValues(profile),
  });
  const { errors, isDirty } = form.formState;

  const onSubmit = form.handleSubmit((values) =>
    save.mutate(values, {
      onSuccess: (saved) => {
        form.reset(toFormValues(saved));
        toast.success("Profile saved");
      },
      onError: (error) => {
        if (!applyServerErrors(error, form.setError)) toast.error(error.message);
      },
    }),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Introduction</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid gap-6 sm:grid-cols-2">
              <InputField
                id="fullName"
                label="Name"
                autoComplete="name"
                error={errors.fullName}
                registration={form.register("fullName")}
              />
              <InputField
                id="location"
                label="Location"
                error={errors.location}
                registration={form.register("location", { setValueAs: emptyToNull })}
              />
            </div>
            <InputField
              id="headline"
              label="Headline"
              description="One line under your name, for example your role and focus."
              error={errors.headline}
              registration={form.register("headline")}
            />
            <TextareaField
              id="bio"
              label="Bio"
              rows={6}
              description="Separate paragraphs with an empty line."
              error={errors.bio}
              registration={form.register("bio")}
            />
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Contact and links</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid gap-6 sm:grid-cols-2">
              <InputField
                id="email"
                label="Public email"
                type="email"
                error={errors.email}
                registration={form.register("email", { setValueAs: emptyToNull })}
              />
              <InputField
                id="avatarUrl"
                label="Photo URL"
                type="url"
                placeholder="https://"
                error={errors.avatarUrl}
                registration={form.register("avatarUrl", { setValueAs: emptyToNull })}
              />
              <InputField
                id="githubUrl"
                label="GitHub URL"
                type="url"
                placeholder="https://github.com/"
                error={errors.githubUrl}
                registration={form.register("githubUrl", { setValueAs: emptyToNull })}
              />
              <InputField
                id="linkedinUrl"
                label="LinkedIn URL"
                type="url"
                placeholder="https://www.linkedin.com/in/"
                error={errors.linkedinUrl}
                registration={form.register("linkedinUrl", { setValueAs: emptyToNull })}
              />
            </div>
          </FieldGroup>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={save.isPending || !isDirty}>
          {save.isPending && <Loader2 className="animate-spin" aria-hidden />}
          Save profile
        </Button>
      </div>
    </form>
  );
}
