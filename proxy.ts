import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    // A token without an id belongs to a deleted user (see the jwt callback in lib/auth.ts)
    authorized: ({ token }) => Boolean(token?.id),
  },
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
