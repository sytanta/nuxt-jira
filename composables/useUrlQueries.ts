import { useParamWatcherStore } from "~/stores/urlParamWatcher";

export const useUrlQueries = (
  queryKeys: Record<string, (val?: string | null) => string | null | undefined>,
  options?: {
    delay?: number;
    replace?: boolean;
    preserveHash?: boolean;
  },
) => {
  const route = useRoute();
  const store = useParamWatcherStore();

  // Get the current query value
  const queriesValue = computed(() => {
    const keys = Object.keys(queryKeys);
    return keys.reduce(
      (acc, key) => {
        const parseFunc = queryKeys[key];
        const value = route.query[key];
        acc[key] = parseFunc(Array.isArray(value) ? value[0] : value);
        return acc;
      },
      {} as Record<string, string | null | undefined>,
    );
  });

  // Set/update the query parameter
  const setQueryValue = (queryKey: string, value?: string | null) => {
    store.setUrlParam(queryKey, value, options);
  };

  // Clear the query parameter
  const clearQuery = (queryKey: string) => {
    setQueryValue(queryKey, null);
  };

  // Clear all query parameters
  const clearQueries = () => {
    const keys = Object.keys(queryKeys);
    keys.map((key) => setQueryValue(key, null));
  };

  return {
    value: readonly(queriesValue),
    setQueryValue,
    clearQuery,
    clearQueries,
  };
};
