import { Models } from "node-appwrite";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const { user } = event.context as {
    user: Models.User<any> | undefined;
  };
  if (!user) return;

  const { account } = event.context;

  // Remove session cookie
  await account?.deleteSession("current");
  deleteCookie(event, config.public.sessionCookieName);

  await sendRedirect(event, "/sign-in");
});
