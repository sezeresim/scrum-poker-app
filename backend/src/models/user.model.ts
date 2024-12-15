import { Column, Model, Table, ForeignKey } from 'sequelize-typescript';
import { Room } from './room.model';

@Table({
  timestamps: true,
})
export class User extends Model {
  @Column({ primaryKey: true })
  id: string;

  @Column
  userId: string;

  @Column
  name: string;

  @Column({
    defaultValue: null
  })
  vote: number;

  @Column
  status: string;

  @ForeignKey(() => Room)
  @Column
  roomId: string;

  @Column
  isVoted: boolean;
}

export interface IUser {
  id: string;
  userId: string;
  name: string;
  vote: number | null;
  status: string;
  roomId: string;
  isVoted: boolean;
}
