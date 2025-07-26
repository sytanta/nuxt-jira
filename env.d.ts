import type { Account, Databases, Models, Storage } from "node-appwrite";

declare module "h3" {
  interface H3EventContext {
    user: Models.User<Models.Preferences> | null;
    account: Account | null;
    databases: Databases | null;
    storage: Storage | null;
  }
}
