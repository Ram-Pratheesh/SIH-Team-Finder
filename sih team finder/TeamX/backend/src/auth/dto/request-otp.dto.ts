import { IsEmail } from 'class-validator';

export class RequestOtpDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;
}
