import { z } from "zod";

export const SigninSchema = z.object({
  email: z.string().email("Email is invalid").min(1, "Email is required"),
  password: z.string().min(1, "Incorrect Password"),
});

export type SigninSchemaType = z.infer<typeof SigninSchema>;

export const SignupSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Email is invalid").min(1, "Email is required"),
    password: z.string().min(6, "Min 6 characters are required"),
    confirmPassword: z.string().min(6, "Min 6 characters are required"),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "The passwords did not match",
        path: ["confirmPassword"],
      });
    }
  });

export type SignupSchemaType = z.infer<typeof SignupSchema>;
