import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import { getMongoDnsFallback } from "@/lib/mongodb-dns";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Missing MONGODB_URI in environment variables");
}

const mongoDnsFallback = getMongoDnsFallback(uri);

// ---------- Singleton MongoClient (native driver, NOT Mongoose) ----------
// We use a module-level singleton to avoid creating multiple connections
// when Next.js hot-reloads modules in development.

let client;

if (process.env.NODE_ENV === "development") {
  // In development, cache on the global object to survive HMR
  global._mongoNativeClient ??= new MongoClient(uri, mongoDnsFallback);
  client = global._mongoNativeClient;
} else {
  client = new MongoClient(uri, mongoDnsFallback);
}

const db = client.db("barakat_store");

// ---------- Export the betterAuth instance ----------
export const auth = betterAuth({
  database: mongodbAdapter(db),
  emailAndPassword: {
    enabled: true,
  },
  account: {
    accountLinking: {
      trustedProviders: ["google"],
      requireLocalEmailVerified: false,
      updateUserInfoOnLink: true,
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "customer",
      },
    },
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  trustedOrigins: [process.env.BETTER_AUTH_URL || "http://localhost:3000"],
});
