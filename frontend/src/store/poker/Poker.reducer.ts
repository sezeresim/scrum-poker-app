import { ActionTypes } from './Poker.enums';
import type { ReducerActionType, StateType } from './Poker.types';

export const initialState: StateType = {
  username: '',
  userId: '',
  users: [],
  room: {
    id: '',
    adminId: '',
    votesVisible: false,
    name: '',
  },
  isError: false,
};

export default function PokerReducer(
  state: StateType,
  action: ReducerActionType,
): StateType {
  const { type, payload } = action;

  switch (type) {
    case ActionTypes.JOIN_ROOM:
      return {
        ...state,
        room: payload.room,
        username: payload.username,
        userId: payload.userId,
      };
    case ActionTypes.SET_USERS:
      return {
        ...state,
        users: payload.users,
        room: payload.room,
      };
    case ActionTypes.ROOM_NOT_FOUND:
      return {
        ...state,
        isError: payload,
      };
    default:
      return state;
  }
}
