import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProfileDocument = Profile & Document;

@Schema({ timestamps: true })
export class Profile {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  year: string;

  @Prop({ required: true, unique: true })
  collegeMail: string;

  @Prop({ type: [String], default: [] })
  techStacks: string[];

  @Prop({ type: [String], default: [] })
  roles: string[];

  @Prop()
  linkedin: string;

  @Prop()
  github: string;

  @Prop()
  bio: string;

  @Prop({ default: false })
  isPosted: boolean;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
