import {
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { SignInProvider } from 'src/module/iam/domain/enums/sign-in-provider.enum';
import { BaseEntity } from 'src/config/database/orm/base.entity';
import { UserStatus } from 'src/module/user/domain/enum/user-status.enum';
import { UserProfileEntity } from './user-profile.entity';

@Unique(['provider', 'providerUserId'])
@Entity('user')
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('enum', { enum: SignInProvider })
  provider: SignInProvider;

  @Column('enum', { enum: UserStatus, default: UserStatus.INCOMPLETE_PROFILE })
  status: UserStatus;

  @Column('varchar')
  providerUserId: string;

  @OneToOne(() => UserProfileEntity, (profile) => profile.user, { 
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  profile: UserProfileEntity;
}
