import { createSessionClient } from "../lib/appwrite";

export default defineEventHandler(async (event) => {
  const { account, databases, storage, user } = createSessionClient(event);

  try {
    event.context.user = await user;
    event.context.account = account;
    event.context.databases = databases;
    event.context.storage = storage;
  } catch (error) {}
});
