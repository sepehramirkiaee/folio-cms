"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dashboardKeys } from "@/features/dashboard/api/keys";
import { skillKeys, skillsApi } from "../api/skills";
import type { SkillInput, SkillListParams } from "../schemas/skill";

export function useSkillList(params: SkillListParams) {
  return useQuery({
    queryKey: skillKeys.list(params),
    queryFn: () => skillsApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useSkillOptions() {
  return useQuery({
    queryKey: skillKeys.options(),
    queryFn: skillsApi.options,
    staleTime: 5 * 60_000,
  });
}

export function useSkill(id: string) {
  return useQuery({ queryKey: skillKeys.detail(id), queryFn: () => skillsApi.get(id) });
}

/** Lists, pickers and dashboard counts all depend on the set of skills. */
function useInvalidateSkills() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: skillKeys.lists() }),
      queryClient.invalidateQueries({ queryKey: skillKeys.options() }),
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
    ]);
}

export function useCreateSkill() {
  const invalidate = useInvalidateSkills();
  return useMutation({ mutationFn: skillsApi.create, onSuccess: invalidate });
}

export function useUpdateSkill(id: string) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateSkills();
  return useMutation({
    mutationFn: (input: SkillInput) => skillsApi.update(id, input),
    onSuccess: (skill) => {
      queryClient.setQueryData(skillKeys.detail(id), skill);
      return invalidate();
    },
  });
}

export function useDeleteSkill() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateSkills();
  return useMutation({
    mutationFn: skillsApi.remove,
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: skillKeys.detail(id) });
      return invalidate();
    },
  });
}
