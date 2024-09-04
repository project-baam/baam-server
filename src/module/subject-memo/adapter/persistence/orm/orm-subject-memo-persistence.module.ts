import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubjectMemoRepository } from 'src/module/subject-memo/application/port/subject-memo.repository.abstract';
import { OrmSubjectMemoRepository } from './repositories/subject-memo.repository';
import { EventEntity } from 'src/module/calendar/adapter/persistence/orm/entities/event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EventEntity])],
  providers: [
    {
      provide: SubjectMemoRepository,
      useClass: OrmSubjectMemoRepository,
    },
  ],
  exports: [SubjectMemoRepository],
})
export class OrmSubjectMemoPersistenceModule {}
