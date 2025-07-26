import { useParamWatcherStore } from "~/stores/urlParamWatcher";

const defaultUrlBuilder = (queryKey: string, basePath?: string) => {
  return (queryValue: string): string => {
    const route = useRoute();

    // Use provided basePath or current path
    const targetPath = basePath || route.path;

    // Get current query params
    const currentQuery = { ...route.query };

    // Update the specific query parameter
    currentQuery[queryKey] = queryValue;

    // Build the new URL with all query params
    const queryString = new URLSearchParams();

    Object.entries(currentQuery).forEach(([key, value]) => {
      if (value != null) {
        if (Array.isArray(value)) {
          // Handle array values
          value.forEach((v) => v != null && queryString.append(key, v));
        } else {
          queryString.set(key, String(value));
        }
      }
    });

    const queryStr = queryString.toString();
    return queryStr ? `${targetPath}?${queryStr}` : targetPath;
  };
};

export const useUrlQuery = (
  queryKey: string,
  urlBuilder?: (queryValue: string) => string,
  options?: {
    delay?: number;
    replace?: boolean;
    preserveHash?: boolean;
  },
) => {
  const route = useRoute();
  const store = useParamWatcherStore();

  if (!urlBuilder) urlBuilder = defaultUrlBuilder(queryKey);

  // Get the current query value
  const queryValue = computed(() => {
    const value = route.query[queryKey];
    return Array.isArray(value) ? value[0] : value;
  });

  // Set/update the query parameter
  const setQueryValue = (value: string | null | undefined) => {
    store.setUrlParam(queryKey, value, options);
  };

  // Clear the query parameter
  const clearQuery = () => {
    setQueryValue(null);
  };

  return {
    value: readonly(queryValue),
    setQueryValue,
    clearQuery,
  };
};
