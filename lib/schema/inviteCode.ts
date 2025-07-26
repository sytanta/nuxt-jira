import * as z from "zod";

export const InviteCodeSchema = z.object({
  code: z.string(),
});
