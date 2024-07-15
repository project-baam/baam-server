import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { NeisBaseRequestDto } from './base.dto';

export class ClassInfoRequest extends NeisBaseRequestDto {
  @IsNotEmpty()
  @IsString()
  ATPT_OFCDC_SC_CODE: string; // 시도교육청코드

  @IsNotEmpty()
  @IsString()
  SD_SCHUL_CODE: string; // 행정표준코드

  @IsOptional()
  @IsString()
  AY?: string; // 학년도

  @IsOptional()
  @IsString()
  GRADE?: string; // 학년

  @IsOptional()
  @IsString()
  DGHT_CRSE_SC_NM?: string; // 주야과정명

  @IsOptional()
  @IsString()
  SCHUL_CRSE_SC_NM?: string; // 학교과정명

  @IsOptional()
  @IsString()
  ORD_SC_NM?: string; // 계열명

  @IsOptional()
  @IsString()
  DDDEP_NM?: string; // 학과명
}

export interface ClassInfo {
  ATPT_OFCDC_SC_CODE: string; // 시도교육청코드
  ATPT_OFCDC_SC_NM: string; // 시도교육청명
  SD_SCHUL_CODE: string; // 행정표준코드
  SCHUL_NM: string; // 학교명
  AY: string; // 학년도
  GRADE: string; // 학년
  DGHT_CRSE_SC_NM: string; // 주야과정명
  SCHUL_CRSE_SC_NM: string; // 학교과정명
  ORD_SC_NM: string; // 계열명
  DDDEP_NM: string; // 학과명
  CLASS_NM: string; // 학급명
  LOAD_DTM: string; // 수정일자
}
