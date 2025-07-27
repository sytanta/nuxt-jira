import { createAdminClient } from "~/server/lib/appwrite";

export default defineEventHandler(async (event) => {
  // Extract the userId and secret from the URL query parameters
  const { userId, secret } = getQuery(event);
  if (!userId || !secret) {
    return sendRedirect(event, "/sign-up");
  }

  const config = useRuntimeConfig(event);
  // Create the Appwrite client
  const { account } = createAdminClient();

  try {
    // Exchange the token userId and secret for a session
    const session = await account.createSession(String(userId), String(secret));
    setCookie(event, config.public.sessionCookieName, session.secret, {
      expires: new Date(session.expire),
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    return { ok: true };
  } catch (e) {
    throw createError({
      status: 400,
      statusText: (e as Error).message || "Failed to authenticate via GitHub",
    });
  }
});
