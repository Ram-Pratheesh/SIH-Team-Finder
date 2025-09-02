import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, MaxLength, IsArray, ArrayNotEmpty } from 'class-validator';

export class SignupDto {
  

  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  
}