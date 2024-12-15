import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Room } from 'src/models/room.model';
import { User } from 'src/models/user.model';

@Injectable()
export class GameService {
  constructor(
    @InjectModel(Room) private roomModel: typeof Room,
    @InjectModel(User) private userModel: typeof User,
  ) {}

  async createRoom({
    adminId,
    name,
  }: {
    adminId: string;
    name: string;
  }): Promise<Room> {
    return this.roomModel.create({
      name,
      adminId,
      votesVisible: false,
    });
  }

  async getRoomById(roomId: string): Promise<Room> {
    return this.roomModel.findByPk(roomId, { include: [User] });
  }

  async getRoomByClientId(id: string): Promise<Room> {
    const user = await this.userModel.findByPk(id);
    if (!user) {
      return null;
    }
    return this.roomModel.findByPk(user.roomId, { include: [User] });
  }

  async addUserToRoom({
    roomId,
    clientId,
    name,
    userId,
    vote = null,
    status = 'active',
    isVoted = false,
  }: {
    roomId: string;
    clientId: string;
    name: string;
    userId: string;
    vote?: number;
    status?: string;
    isVoted?: boolean;
  }): Promise<User> {
    const room = await this.roomModel.findByPk(roomId);
    if (!room) {
      throw new Error('Room not found');
    }
    const user = await this.userModel.create({
      id: clientId,
      name,
      userId,
      vote,
      status,
      roomId,
      isVoted,
    });
    return user;
  }

  async updateUserInRoom({
    roomId,
    clientId,
    name,
    userId,
    vote = null,
    status = 'active',
    isVoted = false,
  }: {
    roomId: string;
    clientId: string;
    name: string;
    userId: string;
    vote?: number;
    status?: string;
    isVoted?: boolean;
  }): Promise<User> {
    await this.userModel.update(
      {
        id: clientId,
        name,
        userId,
        vote,
        status,
        roomId,
        isVoted,
      },
      { where: { id: userId } },
    );
    const updatedUser = await this.userModel.findOne({
      where: { userId: userId },
    });
    return updatedUser;
  }

  async updateUserNameInRoom(args: {
    userId: string;
    name: string;
  }): Promise<void> {
    await this.userModel.update(
      { name: args.name },
      { where: { userId: args.userId } },
    );
  }

  async removeUserFromRoomByClientId(
    roomId: string,
    clientId: string,
  ): Promise<void> {
    await this.userModel.destroy({ where: { id: clientId, roomId } });
  }

  async addVoteToRoom(id: string, vote: number): Promise<void> {
    await this.userModel.update(
      { vote, isVoted: true },
      {
        where: { id },
      },
    );
  }

  async clearVotesInRoom(roomId: string): Promise<void> {
    const room = await this.roomModel.findByPk(roomId, { include: [User] });
    for (const user of room.users) {
      user.vote = null;
      user.isVoted = false;
      await user.save();
    }
    room.votesVisible = false;
    await room.save();
  }

  async showVotesInRoom(roomId: string): Promise<void> {
    await this.roomModel.update(
      { votesVisible: true },
      { where: { id: roomId } },
    );
  }

  async hideVotesInRoom(roomId: string): Promise<void> {
    await this.roomModel.update(
      { votesVisible: false },
      { where: { id: roomId } },
    );
  }

  async getUsersInRoom(roomId: string): Promise<User[]> {
    const room = await this.roomModel.findByPk(roomId, { include: [User] });
    return room.users;
  }
}
