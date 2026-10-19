import { db } from "@/lib/db";
import { clearFailedLogins, getClientIp, isLoginLocked, recordFailedLogin } from "@/lib/rate-limit";
import bcrypt from "bcryptjs";
import { getServerSession, NextAuthOptions, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const ip = getClientIp(req.headers);

        // Surfaced to the client as `error: "TooManyAttempts"`
        if (await isLoginLocked(credentials.username, ip)) {
          throw new Error("TooManyAttempts");
        }

        // Prefer an exact match so legacy accounts differing only by case keep working,
        // then fall back to a case-insensitive lookup
        const user =
          (await db.user.findUnique({
            where: { username: credentials.username },
          })) ??
          (await db.user.findFirst({
            where: { username: { equals: credentials.username, mode: "insensitive" } },
          }));

        if (!user) {
          await recordFailedLogin(credentials.username, ip);
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          await recordFailedLogin(credentials.username, ip);
          return null;
        }

        await clearFailedLogins(credentials.username);

        return {
          id: user.id,
          name: user.username,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        return token;
      }

      // Drop the id if the user no longer exists, which signs the session out
      if (token.id) {
        try {
          const exists = await db.user.findUnique({ where: { id: token.id }, select: { id: true } });
          if (!exists) {
            delete token.id;
          }
        } catch (error) {
          // Keep the session on DB errors; a thrown error here would clear the session cookie
          console.error("Session user lookup failed:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      // An empty session is treated as signed out by both getServerSession and useSession
      if (!token.id) {
        return {} as Session;
      }
      session.user.id = token.id;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function getSessionUserId() {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}
