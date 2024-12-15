import { IUser } from 'src/models/user.model';

export interface ClientToServerEvents {
  createRoom: (data: { userId: string; roomName: string }) => void;
  joinRoom: (data: {
    roomId: string;
    username: string;
    userId: string;
  }) => void;
  vote: (data: { roomId: string; vote: number }) => void;
  showVotes: (data: { roomId: string; userId: string }) => void;
  hideVotes: (data: { roomId: string; userId: string }) => void;
  clearVotes: (data: { roomId: string; userId: string }) => void;
  updateUser: (data: { userId: string; name: string }) => void;
}

export interface ServerToClientEvents {
  roomCreated: (args: { roomId: string; roomName: string }) => void;
  roomNotFound: () => void;
  roomUpdated: (data: {
    users: IUser[];
    room: { id: string; adminId: string; votesVisible: boolean; name: string };
  }) => void;
}

export interface InterServerEvents {
  // Define any inter-server events if needed
}

export interface SocketData {
  // Define any additional socket data if needed
}
