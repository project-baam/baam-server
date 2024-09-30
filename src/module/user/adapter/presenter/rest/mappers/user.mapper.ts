import { plainToInstance } from 'class-transformer';

import { User } from 'src/module/user/domain/user';
import { UserEntity } from '../../../persistence/orm/entities/user.entity';

export class UserMapper {
  static toDomain(entity: UserEntity): User {
    return plainToInstance(
      User,
      {
        id: entity.id,
        status: entity.status,
        provider: entity.provider,
        schoolId: entity.profile?.class.schoolId,
        schoolName: entity.profile?.class.school.name,
        grade: entity.profile?.class.grade,
        className: entity.profile?.class.name,
        fullName: entity.profile?.fullName,
        profileImageUrl: entity.profile?.profileImageUrl,
        backgroundImageUrl: entity.profile?.backgroundImageUrl,
        isTimetablePublic: entity.profile?.isTimetablePublic,
        isClassPublic: entity.profile?.isClassPublic,
        notificationsEnabled: entity.profile?.notificationsEnabled,
      },
      {
        exposeDefaultValues: true,
      },
    );
  }
}
