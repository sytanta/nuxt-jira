import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },

  css: ["~/assets/css/main.css"],
  vite: { plugins: [tailwindcss()] },

  modules: [
    "shadcn-nuxt",
    "@nuxt/fonts",
    "@nuxt/image",
    "@nuxt/icon",
    "@pinia/nuxt",
  ],

  runtimeConfig: {
    appwriteKey: process.env.APPWRITE_KEY,
    public: {
      sessionCookieName: process.env.PUBLIC_SESSION_COOKIE_NAME,
      appwriteProjectId: process.env.PUBLIC_APPWRITE_PROJECT,
      appwriteEndpoint: process.env.PUBLIC_APPWRITE_ENDPOINT,
      appwriteDatabaseId: process.env.PUBLIC_APPWRITE_DATABASE_ID,
      appwriteWorkspacesId: process.env.PUBLIC_APPWRITE_WORKSPACES_ID,
      appwriteMembersId: process.env.PUBLIC_APPWRITE_MEMBERS_ID,
      appwriteProjectsId: process.env.PUBLIC_APPWRITE_PROJECTS_ID,
      appwriteTasksId: process.env.PUBLIC_APPWRITE_TASKS_ID,
      appwriteImagesBucketId: process.env.PUBLIC_APPWRITE_IMAGES_BUCKET_ID,
    },
  },

  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: "",
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: "./components/ui",
  },

  fonts: {
    families: [{ name: "Inter", provider: "google" }],
    defaults: {
      weights: ["400 700"],
      styles: ["normal", "italic"],
      subsets: ["latin"],
    },
  },
});
