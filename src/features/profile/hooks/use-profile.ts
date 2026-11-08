"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { profileApi, profileKeys } from "../api/profile";

export function useProfile() {
  return useQuery({ queryKey: profileKeys.all, queryFn: profileApi.get });
}

export function useSaveProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileApi.save,
    onSuccess: (profile) => queryClient.setQueryData(profileKeys.all, profile),
  });
}
