import { OAuthProvider } from "node-appwrite";

import { createAdminClient } from "~/server/lib/appwrite";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const { account } = createAdminClient();

  const redirectUrl = await account.createOAuth2Token(
    "github" as OAuthProvider,
    `${config.public.siteUrl}/oauth/github/callback`,
    `${config.public.siteUrl}/sign-up`,
  );

  // Redirect user to the OAuth provider authorization page
  await sendRedirect(event, redirectUrl);
});
