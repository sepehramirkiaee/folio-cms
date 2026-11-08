"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dashboardKeys } from "@/features/dashboard/api/keys";
import { skillKeys } from "@/features/skills/api/skills";
import { projectKeys, projectsApi } from "../api/projects";
import type { ProjectInput, ProjectListParams, ProjectOrderItem } from "../schemas/project";

export function useProjectList(params: ProjectListParams) {
  return useQuery({
    queryKey: projectKeys.list(params),
    queryFn: () => projectsApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useProjectOrder() {
  return useQuery({ queryKey: projectKeys.order(), queryFn: projectsApi.order });
}

export function useProject(id: string) {
  return useQuery({ queryKey: projectKeys.detail(id), queryFn: () => projectsApi.get(id) });
}

function useInvalidateProjects() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() }),
      queryClient.invalidateQueries({ queryKey: projectKeys.order() }),
      // Skill usage counts change when projects gain or lose skills.
      queryClient.invalidateQueries({ queryKey: skillKeys.lists() }),
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
    ]);
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateProjects();
  return useMutation({
    mutationFn: projectsApi.create,
    onSuccess: (project) => {
      queryClient.setQueryData(projectKeys.detail(project.id), project);
      return invalidate();
    },
  });
}

export function useUpdateProject(id: string) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateProjects();
  return useMutation({
    mutationFn: (input: ProjectInput) => projectsApi.update(id, input),
    onSuccess: (project) => {
      queryClient.setQueryData(projectKeys.detail(id), project);
      return invalidate();
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateProjects();
  return useMutation({
    mutationFn: projectsApi.remove,
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: projectKeys.detail(id) });
      return invalidate();
    },
  });
}

/**
 * Saves a new manual order with an optimistic update: the list moves
 * immediately, rolls back if the server rejects it, and is refetched either
 * way so it ends up matching the database.
 */
export function useReorderProjects() {
  const queryClient = useQueryClient();
  const key = projectKeys.order();

  return useMutation({
    mutationFn: (items: ProjectOrderItem[]) => projectsApi.saveOrder(items.map((p) => p.id)),
    onMutate: async (items) => {
      // Stop in-flight fetches from overwriting the optimistic order.
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<ProjectOrderItem[]>(key);
      queryClient.setQueryData<ProjectOrderItem[]>(
        key,
        items.map((p, index) => ({ ...p, sortOrder: index })),
      );
      return { previous };
    },
    onError: (_error, _items, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: key }),
        queryClient.invalidateQueries({ queryKey: projectKeys.lists() }),
      ]),
  });
}
