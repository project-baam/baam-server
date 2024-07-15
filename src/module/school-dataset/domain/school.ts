import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class School {
  @ApiProperty({ description: '학교 ID' })
  @Expose()
  id: number;

  @ApiProperty({ description: '학교명', example: '가락고등학교' })
  @Expose()
  name: string;

  @ApiProperty({ description: '학교명(영문)', example: 'Garak High School' })
  @Expose()
  nameUs: string;

  @ApiProperty({ description: '우편 번호', example: '05678' })
  @Expose()
  postalCode: string;

  @ApiProperty({
    description: '도로명 주소',
    example: '서울특별시 송파구 송이로 42 (송파동/가락고등학교)',
  })
  @Expose()
  roadNameAddress: string;
}
