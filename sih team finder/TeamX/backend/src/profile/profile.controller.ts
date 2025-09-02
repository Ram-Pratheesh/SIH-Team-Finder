// src/profile/profile.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/user.decorator';

@UseGuards(JwtAuthGuard)   // ✅ All routes are now protected
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post('setup')
  async createOrUpdate(
    @CurrentUser() user: any,
    @Body() createProfileDto: CreateProfileDto,
  ) {
    const profile = await this.profileService.createOrUpdate(
      user.userId,
      createProfileDto,
    );
    return { message: 'Profile saved successfully', profile };
  }

  @Get('me')
  async getMyProfile(@CurrentUser() user: any) {
    return this.profileService.findByUserId(user.userId);
  }

  @Get()
  async findAll() {
    return this.profileService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.profileService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profileService.update(id, dto, user.userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.profileService.remove(id, user.userId);
  }

  @Patch(':id/post')
async postProfile(@Param('id') id: string, @CurrentUser() user: any) {
  return this.profileService.postProfile(id, user.userId);
}

  @Get('posted/all')
  async getPostedProfiles() {
    const profiles = await this.profileService.getPostedProfiles();
    return { profiles };
  }

  @Patch(':id/unpost')
async unpostProfile(@Param('id') id: string, @CurrentUser() user: any) {
  return this.profileService.unpostProfile(id, user.userId);
}  

  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string) {
    return this.profileService.findByUserId(userId);
  }
}
