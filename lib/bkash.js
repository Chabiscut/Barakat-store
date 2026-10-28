import { randomUUID } from "node:crypto";
import connectToDatabase from "@/lib/mongodb";
import BkashToken from "@/models/BkashToken";

const TOKEN_PATH = "/v2/tokenized-checkout/auth/grant-token";
const REFRESH_PATH = "/v2/tokenized-checkout/auth/refresh-token";
const TOKEN_REFRESH_MARGIN_MS = 5 * 60 * 1000;
const LOCK_DURATION_MS = 45 * 1000;
const TOKEN_LOCK_WAIT_MS = 30 * 1000;
const ALLOWED_API_ORIGINS = new Set([
  "https://tokenized.sandbox.bka.sh",
  "https://tokenized.pay.bka.sh",
]);

let tokenRefreshPromise;

export function getBkashConfig() {
  const config = {
    username: process.env.BKASH_USERNAME,
    password: process.env.BKASH_PASSWORD,
    appKey: process.env.BKASH_APP_KEY,
    appSecret: process.env.BKASH_APP_SECRET,
    baseUrl: process.env.BKASH_BASE_URL || "https://tokenized.sandbox.bka.sh",
  };

  if (!config.username || !config.password || !config.appKey || !config.appSecret) {
    throw new Error("bKash merchant credentials are not configured.");
  }

  let baseOrigin;
  try {
    const parsedUrl = new URL(config.baseUrl);
    if (parsedUrl.pathname !== "/" || parsedUrl.search || parsedUrl.hash) {
      throw new Error("Invalid bKash API URL.");
    }
    baseOrigin = parsedUrl.origin;
  } catch {
    throw new Error("Invalid bKash API URL.");
  }

  if (!ALLOWED_API_ORIGINS.has(baseOrigin)) {
    throw new Error("The configured bKash API URL is not supported.");
  }

  return { ...config, baseUrl: baseOrigin };
}

async function requestBkashToken(path, config, refreshToken) {
  const response = await fetch(`${config.baseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      username: config.username,
      password: config.password,
    },
    body: JSON.stringify({
      app_key: config.appKey,
      app_secret: config.appSecret,
      ...(refreshToken ? { refresh_token: refreshToken } : {}),
    }),
    signal: AbortSignal.timeout(30_000),
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);
  if (
    !response.ok ||
    !data?.id_token ||
    (data.statusCode && data.statusCode !== "0000")
  ) {
    throw new Error("bKash authorization could not be refreshed.");
  }

  return {
    idToken: data.id_token,
    refreshToken: data.refresh_token || refreshToken || "",
    expiresAt: new Date(
      Date.now() + Math.max(Number(data.expires_in) || 3600, 60) * 1000
    ),
  };
}

async function getCachedAccessToken(config) {
  await connectToDatabase();

  try {
    await BkashToken.updateOne(
      { _id: "current" },
      { $setOnInsert: { lockExpiresAt: new Date(0) } },
      { upsert: true }
    );
  } catch (error) {
    if (error?.code !== 11000) throw error;
  }

  const current = await BkashToken.findById("current").lean();
  if (current?.idToken && current.expiresAt?.getTime() > Date.now() + TOKEN_REFRESH_MARGIN_MS) {
    return current.idToken;
  }

  const lockId = randomUUID();
  const now = new Date();
  const locked = await BkashToken.findOneAndUpdate(
    {
      _id: "current",
      $or: [
        { lockExpiresAt: null },
        { lockExpiresAt: { $exists: false } },
        { lockExpiresAt: { $lte: now } },
      ],
    },
    {
      $set: {
        lockId,
        lockExpiresAt: new Date(Date.now() + LOCK_DURATION_MS),
      },
    },
    { new: true }
  );

  if (!locked) {
    const waitUntil = Date.now() + TOKEN_LOCK_WAIT_MS;
    while (Date.now() < waitUntil) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      const refreshed = await BkashToken.findById("current").lean();
      if (
        refreshed?.idToken &&
        refreshed.expiresAt?.getTime() > Date.now() + 30_000
      ) {
        return refreshed.idToken;
      }
    }
    throw new Error("Timed out while waiting for bKash authorization.");
  }

  try {
    if (
      locked.idToken &&
      locked.expiresAt?.getTime() > Date.now() + TOKEN_REFRESH_MARGIN_MS
    ) {
      return locked.idToken;
    }

    const refreshedToken = await requestBkashToken(
      locked.refreshToken ? REFRESH_PATH : TOKEN_PATH,
      config,
      locked.refreshToken
    );
    const saved = await BkashToken.findOneAndUpdate(
      { _id: "current", lockId },
      {
        $set: {
          idToken: refreshedToken.idToken,
          refreshToken: refreshedToken.refreshToken,
          expiresAt: refreshedToken.expiresAt,
        },
        $unset: { lockId: 1, lockExpiresAt: 1 },
      },
      { new: true }
    );

    if (!saved) throw new Error("Could not save bKash authorization.");
    return refreshedToken.idToken;
  } finally {
    await BkashToken.updateOne(
      { _id: "current", lockId },
      { $unset: { lockId: 1, lockExpiresAt: 1 } }
    );
  }
}

export async function getBkashAccessToken(config = getBkashConfig()) {
  if (!tokenRefreshPromise) {
    tokenRefreshPromise = getCachedAccessToken(config).finally(() => {
      tokenRefreshPromise = null;
    });
  }
  return tokenRefreshPromise;
}

export async function bkashRequest(path, body) {
  const config = getBkashConfig();
  const idToken = await getBkashAccessToken(config);
  const response = await fetch(`${config.baseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: idToken,
      "X-App-Key": config.appKey,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);
  if (!response.ok || !data || (data.statusCode && data.statusCode !== "0000")) {
    throw new Error("The bKash payment request could not be completed.");
  }

  return data;
}
