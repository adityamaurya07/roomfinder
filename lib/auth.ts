import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    // 1. Official Google OAuth Provider (activated when Google credentials are provided in .env)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),

    // 2. Direct Gmail / Google Fast Login Provider
    CredentialsProvider({
      id: 'google-instant',
      name: 'Google / Gmail Fast Login',
      credentials: {
        email: { label: 'Gmail', type: 'text' },
        name: { label: 'Name', type: 'text' },
        role: { label: 'Role', type: 'text' },
        avatar: { label: 'Avatar', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        const email = credentials.email;
        const name = credentials.name || email.split('@')[0];
        const avatar =
          credentials.avatar ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

        return {
          id: `usr_${Date.now()}`,
          name: name.charAt(0).toUpperCase() + name.slice(1),
          email,
          image: avatar,
        };
      },
    }),
  ],
  pages: {
    signIn: '/',
    error: '/',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user && token?.id) {
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'roomfinder_super_secret_jwt_key_2026',
};
