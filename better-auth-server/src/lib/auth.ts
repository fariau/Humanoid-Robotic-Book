import {betterAuth} from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg"
  }),
  emailAndPassword: {
    enabled: true
  },
  user: {
    // Add custom fields to the user profile
    additionalFields: {
      softwareBackground: {
        type: "string",
        required: false,
      },
      hasNvidiaRtxGpu: {
        type: "boolean",
        required: false,
      },
      hasJetsonKit: {
        type: "boolean",
        required: false,
      },
      hasRoboticsExperience: {
        type: "boolean",
        required: false,
      }
    }
  },
  secret: process.env.BETTER_AUTH_SECRET!
});