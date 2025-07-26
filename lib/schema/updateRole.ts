import * as z from "zod";

import { MEMBER_ROLE } from "../constant";

export const UpdateMemberRoleSchema = z.object({
  name: z.nativeEnum(MEMBER_ROLE),
});
