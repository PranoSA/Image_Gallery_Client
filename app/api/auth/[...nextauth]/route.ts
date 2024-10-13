import NextAuth, { Account, AuthOptions, User } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import KeycloakProvider from 'next-auth/providers/keycloak';
import { NextResponse } from 'next/server';
import PostgresAdapter from '@auth/pg-adapter';
import { Pool } from 'pg';

const refreshAccessToken = async (token: JWT) => {
  try {
    const url = `${process.env.KEYCLOAK_ISSUER_URL}/protocol/openid-connect/token`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.KEYCLOAK_CLIENT_ID as string,
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET as string,
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken as string,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
    };
  } catch (error) {
    console.error('Error refreshing access token', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
};

export const authOptions: AuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID as string,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET as string,
      issuer: process.env.KEYCLOAK_ISSUER as string,
    }),
  ],
  //postgres adapter
  session: {
    maxAge: 30 * 24 * 60 * 60, //30 days
  },

  callbacks: {
    async session({ session, token, user }) {
      //      session.user = user;
      //     session.user.sub = token.sub;

      //check session error
      if (token.error) {
        //log user out, and invalidate session
        session.expires = new Date(0).toISOString();
        session.accessToken = undefined;
        throw new NextResponse('Unauthorized', { status: 401 });
        return session;
      }

      session.accessToken = token.accessToken as string;

      return session;
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account) {
        token.accessToken = account.access_token;
        token.accessTokenExpires = account.expires_at || 0 * 1000;
        token.refreshToken = account.refresh_token;
        token.token = account.id_token;
      }

      // Initial sign in
      if (account && user) {
        return {
          accessToken: account.accessToken,
          //@ts-ignore
          //add a month to the current date
          //next-auth should expire the token after a month
          accessTokenExpires: Date.now() + account.expires_in * 1000,
          refreshToken: account.refresh_token,
          user,
        };
      }

      // Return previous token if the access token has not expired yet
      //@ts-ignore
      if (Date.now() < token.accessTokenExpires) {
        return token;
      }


      //if refresh token is expires, log out

      // Access token has expired, try to update it
      const extrapolated = refreshAccessToken(token);

      //@ts-ignore
      if (extrapolated.error) {
        //log user out
        return {
          error: 'RefreshAccessTokenError',
        };
      }

      return extrapolated;
    },
  },
};
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
