import * as z from "zod";

export const CreateWorkspaceSchema = z.object({
  name: z.string().trim().min(1, "Required"),
  image: z
    .union([
      z
        .instanceof(File)
        .refine(
          (file) =>
            ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"].includes(
              file.type,
            ),
          { message: "Invalid image file type" },
        )
        .refine((file) => file.size <= 1024 * 1024, {
          message: "File size should not exceed 1MB",
        }),
      z.string().transform((val) => (val === "" ? undefined : val)),
    ])
    .optional(),
});
