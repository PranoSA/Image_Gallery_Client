import React, { useContext } from 'react';

interface TripContextProps {
  id: string;
}

const TripContext = React.createContext<TripContextProps>({
  id: '0',
});

export default TripContext;
