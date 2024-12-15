import React, { createContext, useContext, useEffect, useMemo } from 'react';
import io, { Socket } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

import {
  ClientToServerEvents,
  ServerToClientEvents,
} from '@/models/socket.types';
import LocalStore from '@/utils/localStore';

interface ContextType {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
}

const Global = createContext<ContextType | undefined>(undefined);

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  const socket = useMemo(() => {
    return io(import.meta.env.VITE_API_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
    });
  }, []);

  useEffect(() => {
    LocalStore.SaveUser();
    socket.connect();

    socket.on('roomCreated', (args) => {
      navigate(`/room/${args.roomId}`);
    });

    return () => {
      socket.off('roomCreated');
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Global.Provider
      value={{
        socket,
      }}
    >
      {children}
    </Global.Provider>
  );
}

export function useGlobalContext(): ContextType {
  const context = useContext(Global);
  if (context === undefined) {
    throw new Error('useGlobalContext must be used within a GlobalProvider');
  }
  return context;
}
