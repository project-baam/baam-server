import { IsIn, IsOptional, IsPositive, Max } from 'class-validator';
import { NEIS_MAX_PAGE_SIZE } from '../constants/neis';

export class NeisBaseRequestDto {
  @IsOptional()
  @IsIn(['xml', 'json'])
  Type?: 'xml' | 'json'; // default: xml

  @IsOptional()
  @IsPositive()
  pIndex?: number; // default: 1

  @IsOptional()
  @Max(NEIS_MAX_PAGE_SIZE)
  @IsPositive()
  pSize?: number; // default: 100
}
