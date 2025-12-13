import { betterAuth } from "better-auth";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  database: {
    provider: "sqlite",
    url: process.env.DATABASE_URL || "./auth.db",
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  user: {
    additionalFields: {
      // Software background
      programmingExperience: {
        type: "string",
        required: false,
      },
      programmingLanguages: {
        type: "string", // JSON stringified array
        required: false,
      },
      softwareBackground: {
        type: "string",
        required: false,
      },
      // Hardware background
      hardwareExperience: {
        type: "string",
        required: false,
      },
      roboticsExperience: {
        type: "string",
        required: false,
      },
      hardwarePlatforms: {
        type: "string", // JSON stringified array
        required: false,
      },
      // Learning goals
      learningGoals: {
        type: "string", // JSON stringified array
        required: false,
      },
      // Personalization level
      personalizedLevel: {
        type: "string", // beginner, intermediate, advanced
        required: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  trustedOrigins: [
    "http://localhost:3000",
    "https://ai-book-seven-pied.vercel.app",
    "https://*.vercel.app",
  ],
});
