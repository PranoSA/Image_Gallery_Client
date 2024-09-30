import NextAuth, { AuthOptions } from 'next-auth';
import KeycloakProvider from 'next-auth/providers/keycloak';

export const authOptions: AuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID as string,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET as string,
      issuer: process.env.KEYCLOAK_ISSUER as string,
    }),
  ],
  callbacks: {
    async session({ session, token, user }) {
      //      session.user = user;
      //     session.user.sub = token.sub;
      session.accessToken = token.accessToken as string;
      return session;
    },
    async jwt({ token, user, account, profile, isNewUser }) {
      //set session.accessToken to account.access_token
      if (account) {
        token.accessToken = account.access_token;
      }

      if (user) {
        token.user = user;
      }

      return token;
    },
  },
};
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
