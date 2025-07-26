import { defineStore } from "pinia";

export const useParamWatcherStore = defineStore("urlParamWatcher", () => {
  const navigationStates = ref<
    Record<
      string,
      {
        pendingNavigation: boolean;
        navigationTimeout: NodeJS.Timeout | null;
        params: Record<string, string | number | null | undefined>;
      }
    >
  >({});

  const getRouteKey = (routePath: string) => {
    return routePath;
  };

  const getNavigationState = (routeKey: string) => {
    if (!navigationStates.value[routeKey]) {
      navigationStates.value[routeKey] = {
        pendingNavigation: false,
        navigationTimeout: null,
        params: {},
      };
    }
    return navigationStates.value[routeKey];
  };

  const setPendingNavigation = (routeKey: string, pending: boolean) => {
    const state = getNavigationState(routeKey);
    state.pendingNavigation = pending;
  };

  const setNavigationTimeout = (
    routeKey: string,
    timeout: NodeJS.Timeout | null,
  ) => {
    const state = getNavigationState(routeKey);
    if (state.navigationTimeout) {
      clearTimeout(state.navigationTimeout);
    }
    state.navigationTimeout = timeout;
  };

  const isPending = (routeKey: string) => {
    return getNavigationState(routeKey).pendingNavigation;
  };

  const cancelPending = (routeKey: string) => {
    const state = getNavigationState(routeKey);
    if (state.navigationTimeout) {
      clearTimeout(state.navigationTimeout);
      state.navigationTimeout = null;
    }
  };

  const cleanup = (routeKey: string) => {
    const state = navigationStates.value[routeKey];
    if (state?.navigationTimeout) {
      clearTimeout(state.navigationTimeout);
    }
    delete navigationStates.value[routeKey];
  };

  const setUrlParam = (
    paramName: string,
    value: string | number | null | undefined,
    options?: {
      delay?: number;
      replace?: boolean;
      preserveHash?: boolean;
    },
  ) => {
    const route = useRoute();
    const router = useRouter();

    const routeKey = getRouteKey(route.path);
    const store = getNavigationState(routeKey);
    store.params[paramName] = value;

    const delay = options?.delay ?? 10;

    if (store.navigationTimeout) clearTimeout(store.navigationTimeout);
    store.navigationTimeout = setTimeout(() => {
      const newQuery = { ...route.query };

      Object.entries(store.params).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") {
          delete newQuery[key];
        } else {
          newQuery[key] = String(value);
        }
      });

      const navigationOptions = {
        path: route.path,
        query: newQuery,
        ...(options?.preserveHash && route.hash ? { hash: route.hash } : {}),
      };

      if (options?.replace) {
        router.replace(navigationOptions);
      } else {
        router.push(navigationOptions);
      }

      nextTick().then(() => cleanup(routeKey));
    }, delay);
  };

  return {
    getRouteKey,
    getNavigationState,
    setPendingNavigation,
    setNavigationTimeout,
    setUrlParam,
    isPending,
    cancelPending,
    cleanup,
  };
});

export const parseAsString = (val?: string | null) =>
  val == undefined ? val : String(val);
