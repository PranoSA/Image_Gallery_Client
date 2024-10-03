import React, { useContext } from 'react';

interface TripContextProps {
  id: string;
  bearer_token: string | null;
  setBearerToken: (token: string) => void;
}

let bearer_token = null;

//set bearer_token function
export const useBearerToken = () => {};

const TripContext = React.createContext<TripContextProps>({
  id: '0',
  bearer_token: null,
  setBearerToken: () => {},
});

export default TripContext;
