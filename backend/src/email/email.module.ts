import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';

@Module({
  imports: [ConfigModule], // so EmailService can use ConfigService
  providers: [EmailService],
  exports: [EmailService], // export so other modules can use it
})
export class EmailModule {}
