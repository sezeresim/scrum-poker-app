import { Column, Model, Table, HasMany, DataType } from 'sequelize-typescript';
import { User } from './user.model';

@Table({
  timestamps: true,
})
export class Room extends Model {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @Column
  name: string;

  @Column
  adminId: string;

  @Column
  votesVisible: boolean;

  @HasMany(() => User)
  users: User[];
}

export type IRoom = {
  id: string;
  name: string;
  adminId: string;
  votesVisible: boolean;
  users?: User[];
};
