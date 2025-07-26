import { SignInSchema } from "~/lib/schema/auth";
import { createAdminClient } from "~/server/lib/appwrite";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const params = await readValidatedBody(event, SignInSchema.safeParse);

  if (params.success) {
    const { account } = createAdminClient();
    const { email, password } = params.data;

    try {
      // Set the session cookie with the secret
      const session = await account.createEmailPasswordSession(email, password);
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
        statusText: (e as Error).message || "Invalid credentials",
      });
    }
  }

  throw createError({ status: 400, statusText: "Invalid credentials" });
});
