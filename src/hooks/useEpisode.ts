import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Hook to fetch a single episode by ID with all its related data.
 * Single source of truth for Episode Workspace.
 */
export function useEpisode(id: string | undefined) {
  const queryClient = useQueryClient();

  const episode = useQuery({
    queryKey: ["episode", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("episodes")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const assets = useQuery({
    queryKey: ["episode-assets", id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from("content_assets")
        .select("*")
        .eq("episode_id", id)
        .order("piece_id", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const tasks = useQuery({
    queryKey: ["episode-tasks", id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("episode_id", id)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const updateEpisode = useMutation({
    mutationFn: async (updates: Record<string, any>) => {
      if (!id) throw new Error("No episode ID");
      const { error } = await supabase
        .from("episodes")
        .update(updates as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["episode", id] });
      queryClient.invalidateQueries({ queryKey: ["episodes"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["episode", id] });
    queryClient.invalidateQueries({ queryKey: ["episode-assets", id] });
    queryClient.invalidateQueries({ queryKey: ["episode-tasks", id] });
  };

  return {
    episode: episode.data,
    isLoading: episode.isLoading,
    assets: assets.data || [],
    tasks: tasks.data || [],
    updateEpisode,
    invalidate,
  };
}

/**
 * Hook to fetch all episodes for listing.
 */
export function useEpisodes() {
  return useQuery({
    queryKey: ["episodes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("episodes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}
