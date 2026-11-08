import { z } from "zod";

/**
 * The public contact form, shared by the form and POST /api/contact.
 * `website` is a honeypot: hidden from people, often filled in by bots.
 */
export const contactSchema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(100, "Use at most 100 characters"),
  email: z.email("Enter a valid email address, so I can reply").trim(),
  subject: z.string().trim().max(150, "Use at most 150 characters").nullable(),
  message: z
    .string()
    .trim()
    .min(10, "Write a message of at least 10 characters")
    .max(5000, "Use at most 5,000 characters"),
  website: z.string().max(200).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
