import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubjectMemoEntity } from './entities/subject-memo.entity';
import { SubjectMemoRepository } from 'src/module/subject-memo/application/port/subject-memo.repository.abstract';
import { OrmSubjectMemoRepository } from './repositories/subject-memo.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SubjectMemoEntity])],
  providers: [
    {
      provide: SubjectMemoRepository,
      useClass: OrmSubjectMemoRepository,
    },
  ],
  exports: [SubjectMemoRepository],
})
export class OrmSubjectMemoPersistenceModule {}
