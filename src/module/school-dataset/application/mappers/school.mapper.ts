import { plainToInstance } from 'class-transformer';
import { SchoolEntity } from './../../adapter/persistence/entities/school.entity';
import { School } from '../../domain/school';

export class SchoolMapper {
  static toDomain(schoolEntity: SchoolEntity): School {
    return plainToInstance(School, schoolEntity, {
      excludeExtraneousValues: true,
    });
  }
}
