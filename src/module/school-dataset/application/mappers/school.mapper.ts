import { plainToInstance } from 'class-transformer';
import { School } from '../../domain/school';
import { SchoolEntity } from '../../adapter/persistence/orm/entities/school.entity';

export class SchoolMapper {
  static toDomain(schoolEntity: SchoolEntity): School {
    return plainToInstance(School, schoolEntity, {
      excludeExtraneousValues: true,
    });
  }
}
