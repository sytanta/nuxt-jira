import type {
  RouteLocationNormalizedGeneric,
  RouteLocationNormalizedLoadedGeneric,
} from "vue-router";
import { sendRedirect } from "h3";

async function authPageProtectMiddleware(
  to: RouteLocationNormalizedGeneric,
  from: RouteLocationNormalizedLoadedGeneric,
) {
  const event = useRequestEvent();
  const user = useState("user");

  // If user is signed-in, redirect to homepage
  if (event && user.value) await sendRedirect(event, "/", 303);
}

export default authPageProtectMiddleware;
