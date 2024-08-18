import { ApiProperty } from '@nestjs/swagger';
import { UserGrade } from 'src/module/school-dataset/domain/value-objects/grade';

export class ClassResponse {
  @ApiProperty({
    type: 'enum',
    enum: UserGrade,
    description: '학년',
    example: UserGrade.First,
  })
  grade: UserGrade;

  @ApiProperty({
    type: 'string',
    isArray: true,
    description: '해당 학년의 모든 학급명',
    example: ['1', '2', '현', '사랑', '국제정치'],
  })
  names: string[];
}
