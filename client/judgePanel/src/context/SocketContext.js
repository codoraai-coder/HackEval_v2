import { createContext, useContext } from 'react';

export const SocketContext = createContext(null);

// Custom hook to use socket context with error handling
export const useSocket = () => {
  const socket = useContext(SocketContext);
  
  if (!socket) {
    console.log('Socket not connected - running in offline mode');
    return null;
  }
  
  return socket;
}; 