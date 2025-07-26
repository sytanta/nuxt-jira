import type {
  RouteLocationNormalizedGeneric,
  RouteLocationNormalizedLoadedGeneric,
} from "vue-router";
import { sendRedirect } from "h3";

async function authenticatedPageProtectMiddleware(
  to: RouteLocationNormalizedGeneric,
  from: RouteLocationNormalizedLoadedGeneric,
) {
  const event = useRequestEvent();
  const user = useState("user");

  // If user is unauthorized, redirect to "/sign-in" page
  if (event && !user.value) await sendRedirect(event, "/sign-in", 303);
}

export default authenticatedPageProtectMiddleware;
