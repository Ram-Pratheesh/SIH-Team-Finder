import { 
  IsEmail, 
  IsNotEmpty, 
  IsOptional, 
  IsString, 
  IsArray, 
  ArrayNotEmpty, 
  MaxLength 
} from 'class-validator';

export class CreateProfileDto {
     // Always comes from JWT in backend, but validated anyway

  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  readonly name: string;

  @IsNotEmpty({ message: 'Year is required' })
  @IsString()
  readonly year: string;

  @IsEmail({}, { message: 'Invalid college email format' })
  readonly collegeMail: string;

  @IsArray()
  @ArrayNotEmpty({ message: 'At least one tech stack is required' })
  @IsString({ each: true })
  readonly techStacks: string[];

  @IsArray()
  @ArrayNotEmpty({ message: 'At least one role is required' })
  @IsString({ each: true })
  readonly roles: string[];

  @IsOptional()
  @IsString()
  readonly linkedin?: string;

  @IsOptional()
  @IsString()
  readonly github?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300, { message: 'Bio cannot exceed 300 characters' })
  readonly bio?: string;
}
