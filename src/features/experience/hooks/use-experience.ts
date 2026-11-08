"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dashboardKeys } from "@/features/dashboard/api/keys";
import { skillKeys } from "@/features/skills/api/skills";
import { experienceApi, experienceKeys } from "../api/experience";
import type { ExperienceInput, ExperienceListParams } from "../schemas/experience";

export function useExperienceList(params: ExperienceListParams) {
  return useQuery({
    queryKey: experienceKeys.list(params),
    queryFn: () => experienceApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useExperience(id: string) {
  return useQuery({ queryKey: experienceKeys.detail(id), queryFn: () => experienceApi.get(id) });
}

function useInvalidateExperience() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: experienceKeys.lists() }),
      queryClient.invalidateQueries({ queryKey: skillKeys.lists() }),
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
    ]);
}

export function useCreateExperience() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateExperience();
  return useMutation({
    mutationFn: experienceApi.create,
    onSuccess: (entry) => {
      queryClient.setQueryData(experienceKeys.detail(entry.id), entry);
      return invalidate();
    },
  });
}

export function useUpdateExperience(id: string) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateExperience();
  return useMutation({
    mutationFn: (input: ExperienceInput) => experienceApi.update(id, input),
    onSuccess: (entry) => {
      queryClient.setQueryData(experienceKeys.detail(id), entry);
      return invalidate();
    },
  });
}

export function useDeleteExperience() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateExperience();
  return useMutation({
    mutationFn: experienceApi.remove,
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: experienceKeys.detail(id) });
      return invalidate();
    },
  });
}
