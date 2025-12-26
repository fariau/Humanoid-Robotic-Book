// This file exports the default schema from better-auth
// since better-auth provides its own schema when using the drizzle adapter

import { default as authSchema } from "@better-auth/core/schemas";
import { default as adminSchema } from "@better-auth/core/schemas/admin";
import { default as otpSchema } from "@better-auth/core/schemas/otp";

// Combine all schemas
export const schema = {
  ...authSchema,
  ...adminSchema,
  ...otpSchema,
};