import dns from "node:dns";

const dnsOverHttpsEndpoints = [
  "https://cloudflare-dns.com/dns-query",
  "https://dns.google/resolve",
];
const dnsFailureCodes = new Set([
  "ECONNREFUSED",
  "ETIMEOUT",
  "EAI_AGAIN",
  "EDESTRUCTION",
  "ENODATA",
  "ENOTFOUND",
]);
const dnsStateKey = Symbol.for("barakat-store.mongodb-dns-fallback");

function normalizeHostname(hostname) {
  return hostname.toLowerCase().replace(/\.$/, "");
}

function parseTxtRecord(data) {
  const chunks = data.match(/"(?:\\.|[^"\\])*"/g);
  return chunks ? chunks.map((chunk) => JSON.parse(chunk)).join("") : "";
}

async function queryDnsOverHttps(hostname, recordType) {
  let lastError;

  for (const endpoint of dnsOverHttpsEndpoints) {
    try {
      const url = new URL(endpoint);
      url.searchParams.set("name", hostname);
      url.searchParams.set("type", recordType);

      const response = await fetch(url, {
        headers: { accept: "application/dns-json" },
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        throw new Error(`DNS-over-HTTPS request failed with status ${response.status}`);
      }

      const result = await response.json();

      if (result.Status !== 0 || !result.Answer?.length) {
        throw new Error(`DNS-over-HTTPS returned no ${recordType} records for ${hostname}`);
      }

      return result.Answer.map((answer) => answer.data);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

function installSrvFallback() {
  if (globalThis[dnsStateKey]) {
    return globalThis[dnsStateKey];
  }

  const originalResolve = dns.promises.resolve.bind(dns.promises);
  const registrations = new Map();
  const srvTargets = new Set();

  dns.promises.resolve = async (hostname, recordType) => {
    try {
      return await originalResolve(hostname, recordType);
    } catch (error) {
      if (!dnsFailureCodes.has(error.code)) {
        throw error;
      }

      const normalizedHostname = normalizeHostname(hostname);
      const type = (recordType || "A").toUpperCase();
      const registration = [...registrations.values()].find(
        ({ srvName, host }) =>
          (type === "SRV" && normalizedHostname === srvName) ||
          (type === "TXT" && normalizedHostname === host)
      );

      if (!registration || (type !== "SRV" && type !== "TXT")) {
        throw error;
      }

      const answers = await queryDnsOverHttps(hostname, type);

      if (type === "TXT") {
        return answers.map((answer) => [parseTxtRecord(answer)]);
      }

      const records = answers.map((answer) => {
        const [priority, weight, port, target] = answer.trim().split(/\s+/);
        const normalizedTarget = normalizeHostname(target);
        const parentDomain = registration.host.split(".").slice(1).join(".");

        if (!normalizedTarget.endsWith(`.${parentDomain}`)) {
          throw new Error("MongoDB SRV record target is outside the configured cluster domain");
        }

        srvTargets.add(normalizedTarget);
        return {
          priority: Number(priority),
          weight: Number(weight),
          port: Number(port),
          name: normalizedTarget,
        };
      });

      return records;
    }
  };

  const state = { registrations, srvTargets };
  globalThis[dnsStateKey] = state;
  return state;
}

function createLookup(srvTargets) {
  const nativeLookup = dns.lookup.bind(dns);

  return function lookup(hostname, options, callback) {
    if (typeof options === "function") {
      callback = options;
      options = {};
    } else if (typeof options === "number") {
      options = { family: options };
    }

    const lookupOptions = options || {};

    nativeLookup(hostname, lookupOptions, (error, address, family) => {
      if (!error) {
        callback(null, address, family);
        return;
      }

      if (!dnsFailureCodes.has(error.code) || !srvTargets.has(normalizeHostname(hostname))) {
        callback(error);
        return;
      }

      const families = lookupOptions.family ? [lookupOptions.family] : [4, 6];
      Promise.all(
        families.map(async (recordFamily) => {
          try {
            const type = recordFamily === 4 ? "A" : "AAAA";
            const addresses = await queryDnsOverHttps(hostname, type);
            return addresses.map((resolvedAddress) => ({
              address: resolvedAddress,
              family: recordFamily,
            }));
          } catch {
            return [];
          }
        })
      )
        .then((results) => results.flat())
        .then((addresses) => {
          if (addresses.length === 0) {
            callback(error);
          } else if (lookupOptions.all) {
            callback(null, addresses);
          } else {
            callback(null, addresses[0].address, addresses[0].family);
          }
        })
        .catch(callback);
    });
  };
}

export function getMongoDnsFallback(uri) {
  const parsedUri = new URL(uri);

  if (parsedUri.protocol !== "mongodb+srv:") {
    return {};
  }

  const host = normalizeHostname(parsedUri.hostname);
  const srvName = `_mongodb._tcp.${host}`;
  const { registrations, srvTargets } = installSrvFallback();
  registrations.set(host, { host, srvName });

  return { lookup: createLookup(srvTargets) };
}
