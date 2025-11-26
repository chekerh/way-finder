import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { User, UserSchema } from './user.schema';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ImgBBService } from '../journey/imgbb.service';
import { IndexFixService } from './index-fix.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    HttpModule,
  ],
  controllers: [UserController],
  providers: [UserService, ImgBBService, IndexFixService],
  exports: [UserService, MongooseModule], // Export MongooseModule so other modules can use UserModel
})
export class UserModule {}
