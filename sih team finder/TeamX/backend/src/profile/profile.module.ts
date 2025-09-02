import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { Profile, ProfileSchema } from './schemas/profile.schema';
import { User, UserSchema } from '../users/user.schema'; // ✅ Import User schema

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Profile.name, schema: ProfileSchema },
      { name: User.name, schema: UserSchema }, // ✅ Register User model here
    ]),
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService], // optional, only if other modules need ProfileService
})
export class ProfileModule {}
