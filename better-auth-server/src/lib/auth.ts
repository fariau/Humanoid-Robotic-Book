import { betterAuth } from "better-auth";

export const auth = betterAuth({
  database: {
    provider: "memory",
  },
  emailAndPassword: {
    enabled: true,
  },
});