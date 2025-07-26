import { type H3Event, getCookie } from "h3";
import { Client, Account, Databases, Storage, Users } from "node-appwrite";

export function createAdminClient() {
  const client = new Client()
    .setEndpoint(process.env.PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.PUBLIC_APPWRITE_PROJECT!)
    .setKey(process.env.APPWRITE_KEY!);

  return {
    get account() {
      return new Account(client);
    },
    get users() {
      return new Users(client);
    },
  };
}

export function createSessionClient(event: H3Event) {
  const config = useRuntimeConfig(event);

  const client = new Client()
    .setEndpoint(config.public.appwriteEndpoint)
    .setProject(config.public.appwriteProjectId);

  const databases = new Databases(client);

  const session = getCookie(event, config.public.sessionCookieName);
  if (session) {
    client.setSession(session);

    const account = new Account(client);
    const storage = new Storage(client);

    return {
      get user() {
        return account.get();
      },
      databases,
      account,
      storage,
    };
  }

  return {
    get user() {
      return Promise.resolve(null);
    },
    databases,
    account: null,
    storage: null,
  };
}
