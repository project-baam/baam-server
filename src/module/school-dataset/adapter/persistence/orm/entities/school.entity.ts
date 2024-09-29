import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

import { BaseEntity } from 'src/config/database/orm/base.entity';
import { HighSchoolType } from 'src/module/school-dataset/domain/value-objects/school-type';

@Unique(['officeName', 'name'])
@Entity('school')
export class SchoolEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    type: 'varchar',
    length: 7,
    comment:
      '행정 표준 코드(7자리), 기관별 유일한 코드,\
      officeCode= V10 (재외교육지원담당관실) 일 경우 행정 표준 코드가 빈 문자열\
      -> 급식/학사일정/시간표 조회시 필수 값이라 V10에 해당하는 학교의 경우 데이터 조회 불가',
  })
  code: string;

  @Column({ type: 'varchar', length: 7, comment: '교육청 코드' })
  officeCode: string;

  @Column({ type: 'varchar', comment: '교육청명' })
  officeName: string;

  @Column({ type: 'varchar', comment: '학교명' })
  name: string;

  @Column({ type: 'varchar', nullable: true, comment: '영문학교명' })
  nameUs: string | null;

  @Column('varchar', { comment: '우편 번호' })
  postalCode: string;

  @Column('varchar', { comment: '도로명 주소(상세 주소 포함)' })
  roadNameAddress: string; // ORG_RDNMA + ORG_RDNDA

  @Column({
    type: 'enum',
    enum: HighSchoolType,
    comment: '고등학교 구분명',
  })
  type: HighSchoolType;
}
