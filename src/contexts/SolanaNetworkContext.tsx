import React, { ReactNode, createContext, useContext, useState } from 'react';

// Define a type for the context value
interface SolanaNetworkContextType {
  isSolanaNetwork: boolean;
  setIsSolanaNetwork: React.Dispatch<React.SetStateAction<boolean>>;
}

interface SolanaNetworkProviderProps {
  children: ReactNode
}

// Create a default context value
const defaultSolanaNetworkContext: SolanaNetworkContextType = {
  isSolanaNetwork: false,
  setIsSolanaNetwork: () => { }
};

// Create the context
const SolanaNetworkContext = createContext<SolanaNetworkContextType>(defaultSolanaNetworkContext);

// Custom hook to consume the context
const useSolanaNetwork = () => useContext(SolanaNetworkContext);

const SolanaNetworkProvider: React.FC<SolanaNetworkProviderProps> = ({ children } : SolanaNetworkProviderProps) => {
  const [isSolanaNetwork, setIsSolanaNetwork] = useState<boolean>(false);

  return (
    <SolanaNetworkContext.Provider value={{ isSolanaNetwork, setIsSolanaNetwork }}>
      {children}
    </SolanaNetworkContext.Provider>
  );
};

export { SolanaNetworkContext, useSolanaNetwork, SolanaNetworkProvider };
