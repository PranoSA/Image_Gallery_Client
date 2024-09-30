import KeycloakProvider from 'next-auth/providers/keycloak';
const client_secret = process.env.NEXT_PUBLIC_KEYCLOAK_SECRET;
const client_id = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID;
const issuer = process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER;

import { AuthOptions } from 'next-auth';

export const authOptions: AuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: 'gis-images-client',
      clientSecret: 'I3uf0i0nETkEh8eB4KJnQ0dBqCCOyltA',
      issuer:
        'https://auth.compressibleflowcalculator.com/auth/realms/gis-images',
    }),
    
  ],
  debug: true,
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user) {
        //@ts-ignore
        session.user.id = token.sub;
        //@ts-ignore
        session.user.id = token.sub || '';
      }
      return session;
    },
    jwt: async ({ user, token }) => {
      if (user) {
        token.uid = user.id;
      }
      return token;
    },
  },
};

export default authOptions;
