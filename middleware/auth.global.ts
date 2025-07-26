import { defineNuxtRouteMiddleware, useState } from "nuxt/app";
import { type Models } from "node-appwrite";

import { createSessionClient } from "~/server/lib/appwrite";

export default defineNuxtRouteMiddleware(async () => {
  const userData = useState<Models.User<Models.Preferences> | null>(
    "user",
    () => null,
  );

  // Get user data from cookie & database
  if (import.meta.server) {
    const event = useRequestEvent();

    if (event) {
      const { user } = createSessionClient(event);

      try {
        userData.value = await user;
      } catch (error) {}
    }
  }
});
