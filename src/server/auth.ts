import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { env } from "~/env.mjs";
import { db } from "~/server/db";
import { compare } from "bcrypt";
import { getMemberId } from "~/pages/api/user/getMemberId/getMemberId";



declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string,
      subscriptionPlan: string,
      memberId: string,
    };
  }
}

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user && user.id) {
        return {
          ...token,
          id: user.id,
          type: user.type,
          platformType: user.platformType,
          memberId: await getMemberId(user.id),
          subscriptionPlan: user.subscriptionPlan
        };
      }
      return token;
    },
    session: ({ session, token}) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          type: token.type,
          memberId: token.memberId,
          platformtype: token.platformType,
          subscriptionPlan: token.subscriptionPlan
        },
      };
    },
  },  
  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({
      id: "credentials",
      credentials: {
        email: { label: "email", type: "email" },
        password: { label: "password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const existingUser = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!existingUser) {
          throw new Error("User not found");
        }
        if (!existingUser.password) {
          throw new Error("Sign with gmail");
        }

        const passwordMatch = await compare(
          credentials.password,
          existingUser.password,
        );

        if (!passwordMatch) {
          throw new Error("Password does not match");
        }
        return {
          id: existingUser.id,
          name: existingUser.name,
          type: existingUser.type,
          platformType: existingUser.platformType,
          subscriptionPlan: existingUser.subscriptionPlan}
      },
    }),

    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
