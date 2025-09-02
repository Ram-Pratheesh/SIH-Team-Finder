import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Profile, ProfileDocument } from './schemas/profile.schema';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User, UserDocument } from '../users/user.schema';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(Profile.name) private profileModel: Model<ProfileDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  // ✅ Create or update profile (userId comes separately from JWT)
  async createOrUpdate(userId: string, createProfileDto: CreateProfileDto): Promise<ProfileDocument> {
    const { collegeMail } = createProfileDto;

    let existingProfile = await this.profileModel.findOne({ userId }).exec();
    if (!existingProfile && collegeMail) {
      existingProfile = await this.profileModel.findOne({ collegeMail }).exec();
    }

    let profile: ProfileDocument | null;

    if (existingProfile) {
      profile = await this.profileModel.findByIdAndUpdate(
        existingProfile._id,
        { ...createProfileDto, userId },
        { new: true },
      ).exec();
    } else {
      profile = new this.profileModel({ ...createProfileDto, userId }) as ProfileDocument;
      await profile.save();
    }

    if (!profile) throw new BadRequestException('Profile creation or update failed');

    // Mark user as profile complete
    await this.userModel.findByIdAndUpdate(userId, { isProfileComplete: true });
    return profile;
  }

  async findAll(): Promise<Profile[]> {
    return this.profileModel.find().exec();
  }

  async findOne(id: string): Promise<Profile> {
    const profile = await this.profileModel.findById(id).exec();
    if (!profile) throw new NotFoundException(`Profile with ID ${id} not found`);
    return profile;
  }

  // ✅ Update only if profile belongs to the logged-in user
  async update(id: string, updateProfileDto: UpdateProfileDto, userId: string): Promise<Profile> {
    const profile = await this.profileModel.findById(id).exec();
    if (!profile) throw new NotFoundException(`Profile with ID ${id} not found`);

    if (profile.userId.toString() !== userId) {
      throw new ForbiddenException('You can only update your own profile');
    }

    const updated = await this.profileModel.findByIdAndUpdate(
      id,
      updateProfileDto,
      { new: true },
    ).exec();

    if (!updated) throw new NotFoundException(`Profile with ID ${id} not found after update`);
    return updated;
  }

  // ✅ Delete only if profile belongs to logged-in user
  async remove(id: string, userId: string): Promise<Profile> {
    const profile = await this.profileModel.findById(id).exec();
    if (!profile) throw new NotFoundException(`Profile with ID ${id} not found`);

    if (profile.userId.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own profile');
    }

    const deleted = await this.profileModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException(`Profile with ID ${id} not found for deletion`);
    return deleted;
  }

  async postProfile(id: string, userId: string): Promise<Profile> {
  const profile = await this.profileModel.findById(id).exec();
  if (!profile) throw new NotFoundException(`Profile with ID ${id} not found`);

  if (profile.userId.toString() !== userId) {
    throw new ForbiddenException('You can only post your own profile');
  }

  profile.isPosted = true;
  await profile.save();
  return profile;
}

  async unpostProfile(id: string, userId: string): Promise<Profile> {
  const profile = await this.profileModel.findById(id).exec();
  if (!profile) throw new NotFoundException(`Profile with ID ${id} not found`);

  if (profile.userId.toString() !== userId) {
    throw new ForbiddenException('You can only unpost your own profile');
  }

  profile.isPosted = false;
  await profile.save();
  return profile;
}

  async getPostedProfiles(): Promise<Profile[]> {
    return this.profileModel.find({ isPosted: true }).exec();
  }

  async findByUserId(userId: string): Promise<Profile> {
    const profile = await this.profileModel.findOne({ userId }).exec();
    if (!profile) throw new NotFoundException(`Profile for user ${userId} not found`);
    return profile;
  }
}
