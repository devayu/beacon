import z from "zod";

export const registerRouteSchema = z.object({
  url: z
    .url({
      message: "Please enter a valid URL.",
    })
    .nonoptional(),
  name: z.string().optional(),
  type: z.string().optional(),
});

export type RegisterRouteFormValues = z.infer<typeof registerRouteSchema>;
