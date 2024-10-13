'use client';

/**
 *
 *
 * This verify page takes in a
 * {id} path paraeter
 *
 * and code? query parameter
 *
 * Use both of these to make a request to the server to verify the user
 * at the path /api/v1/verify/{id}?code={code}
 *
 * Then Tell the user its loading -> When Finished
 * You Will Receive A Payload with the Trip Information
 * And you will be redirected to the trip page
 *
 *
 */

import { Trip } from '@/definitions/Trip_View';
import { QueryClientProvider, useQuery } from '@tanstack/react-query';
import { QueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import { createContext, useContext, useEffect, useState } from 'react';

//import context provider

type VerifyContext = {
  id: string;
};

//create context provider
const VerifyContext = createContext<VerifyContext>({
  id: '',
});

type VerifyProviderProps = {
  id: string;
  children: React.ReactNode;
};

//create context provider to wrap the component
const VerifyProvider: React.FC<VerifyProviderProps> = ({ id, children }) => {
  return (
    <VerifyContext.Provider value={{ id }}>{children}</VerifyContext.Provider>
  );
};

const queryClient = new QueryClient();

const PageWithProvider: React.FC<{ params: { id: string } }> = ({
  params: { id },
}) => {
  const [bearerToken, setBearerToken] = useState<string | null>(null);
  const setBearerTokenCallback = (toke: string) => {
    setBearerToken(toke);
  };

  return (
    <VerifyProvider id={id}>
      <QueryClientProvider client={queryClient}>
        <Page />
      </QueryClientProvider>
    </VerifyProvider>
  );
};

const getBearerFromLocalStorage = () => {
  return localStorage.getItem('accessToken');
};

const createRequestHeaders: () => HeadersInit = () => {
  return {
    Authorization: `Bearer ${getBearerFromLocalStorage()}`,
  };
};
///api/v1/invites/:inviteid/accept
const useQueryVerification = (id: string, code: string) => {
  return useQuery({
    queryKey: ['verify', id, code],
    queryFn: async ({ queryKey }) => {
      const [_, id, code] = queryKey;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/invites/${id}/accept?code=${code}`,
        {
          headers: createRequestHeaders(),
        }
      );
      if (!response.ok) {
        throw new Error('Failed to verify');
      }
      const trip: Trip = await response.json();
      return trip;
    },
  });
};

const Page: React.FC = () => {
  const { id } = useContext(VerifyContext);

  //code is the query parameter
  const code = new URLSearchParams(window.location.search).get('code') || '';

  const { data: session, status } = useSession();

  useEffect(() => {
    //set local storage bearer token
    if (session) {
      localStorage.setItem('accessToken', session.accessToken as string);
    }
  }, [session]);

  const {
    data: verification,
    status: verificationStatus,
    error: verificationError,
  } = useQueryVerification(id, code);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    //redirect to sign in page
  }

  if (status === 'authenticated') {
    //set local storage bearer token
    localStorage.setItem('accessToken', session.accessToken as string);
  }

  if (verificationStatus === 'pending') {
    return <div>Loading...</div>;
  }

  if (verificationStatus === 'error') {
    return <div>Error: {verificationError.message}</div>;
  }

  //if completed - pause for a second saying success - then redirect to the trip page
  if (verificationStatus === 'success') {
    setTimeout(() => {
      //redirect to trip page
      window.location.href = `/trip/${verification.id}`;
    }, 1000);
    return <div>Success... Redirecting to Trip Page </div>;
  }

  return <div>Verify Page</div>;
};
export default PageWithProvider;
