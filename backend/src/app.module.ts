import { Controller, Get, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { GameGateway } from './game/game.gateway';
import { GameService } from './game/game.service';
import { Room } from './models/room.model';
import { User } from './models/user.model';
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return 'OK';
  }
}
@Module({
  imports: [
    ConfigModule.forRoot(),
    SequelizeModule.forRoot({
      dialect: 'sqlite',
      storage: 'database.sqlite',
      autoLoadModels: true,
      synchronize: true,
      logging: false,
    }),
    SequelizeModule.forFeature([Room, User]),
  ],
  controllers: [HealthController],
  providers: [GameGateway, GameService],
})
export class AppModule {}
