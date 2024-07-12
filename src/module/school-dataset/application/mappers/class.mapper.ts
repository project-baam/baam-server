import { plainToInstance } from 'class-transformer';
import { ClassEntity } from '../../adapter/persistence/entities/class.entity';
import { Class } from '../../domain/class';

export class ClassMapper {
  static toDomain(classEntity: ClassEntity): Class {
    return plainToInstance(Class, classEntity, {
      excludeExtraneousValues: true,
    });
  }
}
