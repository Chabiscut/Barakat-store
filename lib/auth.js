import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import { getMongoDnsFallback, getMongoUri } from "@/lib/mongodb-dns";

let authInstance;

export function getAuth() {
  if (authInstance) {
    return authInstance;
  }

  const secret = process.env.BETTER_AUTH_SECRET?.trim();
  if (!secret) {
    throw new Error("Missing BETTER_AUTH_SECRET environment variable.");
  }

  const configuredBaseURL = process.env.BETTER_AUTH_URL?.trim();
  const baseURL =
    configuredBaseURL ||
    (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "");

  if (!baseURL) {
    throw new Error("Missing BETTER_AUTH_URL environment variable.");
  }

  let parsedBaseURL;
  try {
    parsedBaseURL = new URL(baseURL);
  } catch {
    throw new Error("Invalid BETTER_AUTH_URL. Use the full public site URL.");
  }

  if (
    !["http:", "https:"].includes(parsedBaseURL.protocol) ||
    (process.env.NODE_ENV === "production" && parsedBaseURL.protocol !== "https:")
  ) {
    throw new Error("BETTER_AUTH_URL must use HTTPS in production.");
  }

  const authBaseURL = parsedBaseURL.origin;
  const uri = getMongoUri();
  const mongoDnsFallback = getMongoDnsFallback(uri);
  let client;

  if (process.env.NODE_ENV === "development") {
    global._mongoNativeClient ??= new MongoClient(uri, mongoDnsFallback);
    client = global._mongoNativeClient;
  } else {
    client = new MongoClient(uri, mongoDnsFallback);
  }

  authInstance = betterAuth({
    database: mongodbAdapter(client.db("barakat_store")),
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
    secret,
    baseURL: authBaseURL,
    trustedOrigins: [authBaseURL],
  });

  return authInstance;
}
