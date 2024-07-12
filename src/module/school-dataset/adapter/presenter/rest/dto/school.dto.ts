import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/request.dto';

export class GetSchoolsRequest extends PaginationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @Expose()
  name?: string;
}
