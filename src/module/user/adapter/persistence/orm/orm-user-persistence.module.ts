import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/module/database/orm/prisma.module';
import { OrmUserRepository } from './repositories/user.repository';
import { UserRepository } from 'src/module/user/application/port/user.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: UserRepository,
      useClass: OrmUserRepository,
    },
  ],
  exports: [UserRepository],
})
export class OrmUserPersistenceModule {}
