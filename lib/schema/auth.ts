import * as z from "zod";

export const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const SignUpSchema = z.object({
  name: z.string().trim().min(1, "Required"),
  email: z.string().email(),
  password: z.string().min(8, "Minumum of 8 characters required"),
});
