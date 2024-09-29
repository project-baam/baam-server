import { plainToInstance } from 'class-transformer';
import { Class } from '../../domain/class';
import { ClassEntity } from '../../adapter/persistence/orm/entities/class.entity';

export class ClassMapper {
  static toDomain(classEntity: ClassEntity): Class {
    return plainToInstance(Class, classEntity, {
      excludeExtraneousValues: true,
    });
  }
}
