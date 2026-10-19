import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const isConfigured = Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

if (!isConfigured) {
  console.warn("Upstash Redis is not configured; sign-in rate limiting is disabled.");
}

const redis = isConfigured ? Redis.fromEnv() : null;

// Failed sign-ins allowed per username (brute-forcing one account)
const usernameLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "15 m"), prefix: "ratelimit:login:username" })
  : null;

// Failed sign-ins allowed per IP (trying many usernames from one client)
const ipLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(20, "15 m"), prefix: "ratelimit:login:ip" })
  : null;

export function getClientIp(headers: Record<string, unknown> | undefined) {
  const forwardedFor = headers?.["x-forwarded-for"];
  if (typeof forwardedFor !== "string") return null;
  return forwardedFor.split(",")[0].trim() || null;
}

function usernameKey(username: string) {
  return username.trim().toLowerCase();
}

// Redis failures are logged and treated as "not limited" so an Upstash outage never locks everyone out
export async function isLoginLocked(username: string, ip: string | null) {
  if (!usernameLimiter || !ipLimiter) return false;
  try {
    const [byUsername, byIp] = await Promise.all([
      usernameLimiter.getRemaining(usernameKey(username)),
      ip ? ipLimiter.getRemaining(ip) : null,
    ]);
    return byUsername.remaining <= 0 || (byIp !== null && byIp.remaining <= 0);
  } catch (error) {
    console.error("Rate limit check failed:", error);
    return false;
  }
}

export async function recordFailedLogin(username: string, ip: string | null) {
  if (!usernameLimiter || !ipLimiter) return;
  try {
    await Promise.all([usernameLimiter.limit(usernameKey(username)), ip ? ipLimiter.limit(ip) : null]);
  } catch (error) {
    console.error("Recording failed login failed:", error);
  }
}

export async function clearFailedLogins(username: string) {
  if (!usernameLimiter) return;
  try {
    await usernameLimiter.resetUsedTokens(usernameKey(username));
  } catch (error) {
    console.error("Clearing failed logins failed:", error);
  }
}
