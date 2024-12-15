import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';
import {
  type ClientToServerEvents,
  type ServerToClientEvents,
  type InterServerEvents,
  type SocketData,
} from 'src/types/socket.types';

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >;

  constructor(private readonly gameService: GameService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    const room = await this.gameService.getRoomByClientId(client.id);
    if (room) {
      await this.gameService.removeUserFromRoomByClientId(room.id, client.id);
      const users = await this.gameService.getUsersInRoom(room.id);
      this.server.to(room.id).emit('roomUpdated', {
        users,
        room: {
          id: room.id,
          adminId: room.adminId,
          votesVisible: room.votesVisible,
          name: room.name,
        },
      });
    }
  }

  @SubscribeMessage('createRoom')
  async handleCreateRoom(
    client: Socket,
    {
      userId,
      roomName,
    }: {
      userId: string;
      roomName: string;
    },
  ) {
    console.log('Creating room for user:', userId);
    const room = await this.gameService.createRoom({
      adminId: userId,
      name: roomName,
    });
    client.join(room.id);
    client.emit('roomCreated', {
      roomId: room.id,
      roomName: room.name,
    });
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    client: Socket,
    {
      roomId,
      username,
      userId,
    }: { roomId: string; username: string; userId: string },
  ) {
    try {
      const room = await this.gameService.getRoomById(roomId);
      if (!room) {
        this.server.to(client.id).emit('roomNotFound');
        return;
      }

      const user = room.users.find((user) => user.userId === userId);

      if (!user) {
        await this.gameService.addUserToRoom({
          roomId: room.id,
          clientId: client.id,
          name: username,
          userId: userId,
        });
      } else {
        await this.gameService.updateUserInRoom({
          roomId: room.id,
          clientId: client.id,
          name: username,
          userId: userId,
        });
      }

      client.join(roomId);
      const users = await this.gameService.getUsersInRoom(roomId);
      this.server.to(roomId).emit('roomUpdated', {
        users,
        room: {
          id: room.id,
          adminId: room.adminId,
          votesVisible: room.votesVisible,
          name: room.name,
        },
      });
    } catch (error) {
      console.error('Error handling joinRoom:', error);
      return { error: 500, message: 'Internal server error' };
    }
  }

  @SubscribeMessage('vote')
  async handleVote(
    client: Socket,
    { roomId, vote }: { roomId: string; vote: number },
  ) {
    try {
      const room = await this.gameService.getRoomById(roomId);
      if (!room) {
        client.emit('error', { message: 'Room not found' });
        return;
      }

      const user = room.users.find((user) => user.id === client.id);
      if (!user) {
        client.emit('error', { message: 'User not found in room' });
        return;
      }

      await this.gameService.addVoteToRoom(user.id, vote);
      const users = await this.gameService.getUsersInRoom(roomId);
      this.server.to(roomId).emit('roomUpdated', {
        users: users.map((user) => ({
          ...user.dataValues,
          vote: room.votesVisible ? user.dataValues.vote : null,
        })),
        room: {
          id: room.id,
          adminId: room.adminId,
          votesVisible: room.votesVisible,
          name: room.name,
        },
      });
    } catch (error) {
      console.error('Error handling vote:', error);
      client.emit('error', { message: 'Failed to process vote' });
    }
  }

  @SubscribeMessage('showVotes')
  async handleShowVotes(
    client: Socket,
    { roomId, userId }: { roomId: string; userId: string },
  ) {
    try {
      const room = await this.gameService.getRoomById(roomId);
      if (!room) {
        client.emit('error', { message: 'Room not found' });
        return;
      }

      if (room.adminId !== userId) {
        client.emit('error', { message: 'Only room admin can show votes' });
        return;
      }

      await this.gameService.showVotesInRoom(roomId);
      const users = await this.gameService.getUsersInRoom(roomId);
      this.server.to(roomId).emit('roomUpdated', {
        users,
        room: {
          id: room.id,
          adminId: room.adminId,
          votesVisible: true,
          name: room.name,
        },
      });
    } catch (error) {
      console.error('Error handling showVotes:', error);
      client.emit('error', { message: 'Failed to show votes' });
    }
  }

  @SubscribeMessage('hideVotes')
  async handleHideVotes(
    client: Socket,
    { roomId, userId }: { roomId: string; userId: string },
  ) {
    try {
      const room = await this.gameService.getRoomById(roomId);
      if (!room) {
        client.emit('error', { message: 'Room not found' });
        return;
      }

      if (room.adminId !== userId) {
        client.emit('error', { message: 'Only room admin can hide votes' });
        return;
      }

      await this.gameService.hideVotesInRoom(roomId);
      const users = await this.gameService.getUsersInRoom(roomId);
      this.server.to(roomId).emit('roomUpdated', {
        users: users.map((user) => ({
          ...user.dataValues,
          vote: null,
        })),
        room: {
          id: room.id,
          adminId: room.adminId,
          votesVisible: false,
          name: room.name,
        },
      });
    } catch (error) {
      console.error('Error handling hideVotes:', error);
      client.emit('error', { message: 'Failed to hide votes' });
    }
  }

  @SubscribeMessage('clearVotes')
  async handleClearVotes(
    client: Socket,
    { roomId, userId }: { roomId: string; userId: string },
  ) {
    try {
      const room = await this.gameService.getRoomById(roomId);
      if (!room) {
        client.emit('error', { message: 'Room not found' });
        return;
      }

      if (room.adminId !== userId) {
        client.emit('error', { message: 'Only room admin can clear votes' });
        return;
      }

      await this.gameService.clearVotesInRoom(roomId);
      const users = await this.gameService.getUsersInRoom(roomId);
      this.server.to(roomId).emit('roomUpdated', {
        users,
        room: {
          id: room.id,
          adminId: room.adminId,
          votesVisible: room.votesVisible,
          name: room.name,
        },
      });
    } catch (error) {
      console.error('Error handling clearVotes:', error);
      client.emit('error', { message: 'Failed to clear votes' });
    }
  }

  @SubscribeMessage('updateUser')
  async handleUpdateUser(
    client: Socket,
    { userId, name }: { userId: string; name: string },
  ) {
    const room = await this.gameService.getRoomByClientId(client.id);
    if (room) {
      await this.gameService.updateUserNameInRoom({
        name,
        userId,
      });
      const updateRoom = await this.gameService.getRoomById(room.id);
      this.server.to(room.id).emit('roomUpdated', {
        users: updateRoom.users,
        room,
      });
    }
  }
}
