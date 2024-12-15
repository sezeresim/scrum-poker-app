import { IUser } from '@/models/socket.types';
import { ActionTypes } from './Poker.enums';

export interface StateType {
  username: string;
  userId: string;
  users: IUser[];
  room: {
    id: string;
    adminId: string;
    votesVisible: boolean;
    name: string;
  };
  isError: boolean;
}

export interface ContextType {
  state: StateType;
  joinRoom: (args: { username: string; roomId: string }) => void;
  submitVote: (args: { vote: string }) => void;
  showVotes: () => void;
  clearVotes: () => void;
}

export type ReducerActionType =
  | {
      type: ActionTypes.JOIN_ROOM;
      payload: Pick<StateType, 'username' | 'userId' | 'room'>;
    }
  | {
      type: ActionTypes.SET_USERS;
      payload: Pick<StateType, 'users' | 'room'>;
    }
  | {
      type: ActionTypes.ROOM_NOT_FOUND;
      payload: StateType['isError'];
    };
