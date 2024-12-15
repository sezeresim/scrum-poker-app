import React, {
  ComponentType,
  createContext,
  useContext,
  useEffect,
  useReducer,
} from 'react';

import PokerReducer, { initialState } from './Poker.reducer';
import { ContextType } from './Poker.types';

import { useGlobalContext } from '../global/Global.context';
import { ActionTypes } from './Poker.enums';
import LocalStore from '@/utils/localStore';
import { ServerToClientEvents } from '@/models/socket.types';

const Poker = createContext<ContextType>({
  state: initialState,
  joinRoom: () => {},
  submitVote: () => {},
  showVotes: () => {},
  clearVotes: () => {},
});

export function PokerProvider({ children }: { children: React.ReactNode }) {
  const { socket } = useGlobalContext();
  const [state, dispatch] = useReducer(PokerReducer, initialState);

  const joinRoom: ContextType['joinRoom'] = ({ username, roomId }) => {
    const userId = LocalStore.GetUser();
    socket.emit('joinRoom', { username, roomId, userId: userId });
    dispatch({
      type: ActionTypes.JOIN_ROOM,
      payload: {
        username: username,
        userId: userId,
        room: {
          id: roomId,
          adminId: '',
          votesVisible: false,
          name: '',
        },
      },
    });
  };

  const submitVote: ContextType['submitVote'] = (args) => {
    if (args.vote !== null) {
      socket.emit('vote', {
        roomId: state.room.id,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        vote: isNaN(args.vote) ? 0 : args.vote,
      });
    }
  };

  const showVotes = () => {
    if (state.room.votesVisible) {
      socket.emit('hideVotes', { roomId: state.room.id, userId: state.userId });
    } else {
      socket.emit('showVotes', { roomId: state.room.id, userId: state.userId });
    }
  };

  const clearVotes = () => {
    socket.emit('clearVotes', { roomId: state.room.id, userId: state.userId });
  };

  const updateUsers: ServerToClientEvents['roomUpdated'] = (args) => {
    console.log('updateUsers', args);
    dispatch({
      type: ActionTypes.SET_USERS,
      payload: {
        users: args.users,
        room: args.room,
      },
    });
  };

  useEffect(() => {
    socket.on('roomUpdated', updateUsers);
    socket.on('roomNotFound', () => {
      dispatch({
        type: ActionTypes.ROOM_NOT_FOUND,
        payload: true,
      });
    });
    return () => {
      socket.off('roomUpdated');
      socket.off('roomNotFound');
    };
  }, []);

  const value: ContextType = {
    state,
    joinRoom,
    submitVote,
    showVotes,
    clearVotes,
  };

  return <Poker.Provider value={value}>{children}</Poker.Provider>;
}

export function withPoker(Component: ComponentType) {
  return function HocWrapper(props: any) {
    return (
      <PokerProvider>
        <Poker.Consumer>{() => <Component {...props} />}</Poker.Consumer>
      </PokerProvider>
    );
  };
}

export function usePokerContext(): ContextType {
  const context = useContext(Poker);
  if (context === undefined) {
    throw new Error('usePokerContext must be used within a PokerProvider');
  }
  return context;
}
