import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { NeisBaseRequestDto } from './base.dto';

export class TimetableRequest extends NeisBaseRequestDto {
  @IsNotEmpty()
  @IsString()
  ATPT_OFCDC_SC_CODE: string;

  @IsNotEmpty()
  @IsString()
  SD_SCHUL_CODE: string;

  @IsOptional()
  @IsString()
  AY?: string; // 학년도

  @IsOptional()
  @IsString()
  SEM?: string; // 학기

  @IsOptional()
  @IsString()
  ALL_TI_YMD?: string; // 시간표 일자

  @IsOptional()
  @IsString()
  DGHT_CRSE_SC_NM?: string; // 주야과정명

  @IsOptional()
  @IsString()
  ORD_SC_NM?: string; // 계열명

  @IsOptional()
  @IsString()
  DDDEP_NM?: string; // 학과명

  @IsOptional()
  @IsString()
  GRADE?: string; // 학년

  @IsOptional()
  @IsString()
  CLRM_NM?: string; // 강의실명

  @IsOptional()
  @IsString()
  CLASS_NM?: string; // 학급명

  @IsOptional()
  @IsString()
  TI_FROM_YMD?: string; // 시간표시작일자

  @IsOptional()
  @IsString()
  TI_TO_YMD?: string; // 시간표종료일자
}

export interface Timetable {
  ATPT_OFCDC_SC_CODE: string; // 시도교육청코드
  ATPT_OFCDC_SC_NM: string; // 시도교육청명
  SD_SCHUL_CODE: string; // 행정표준코드
  SCHUL_NM: string; // 학교명
  AY: string; // 학년도
  SEM: string; // 학기
  ALL_TI_YMD: string; // 시간표일자
  DGHT_CRSE_SC_NM: string; // 주야과정명
  ORD_SC_NM: string; // 계열명
  DDDEP_NM: string; // 학과명
  GRADE: string; // 학년
  CLRM_NM: string; // 강의실명
  CLASS_NM: string; // 학급명
  PERIO: string; // 교시
  ITRT_CNTNT: string; // 수업내용
  LOAD_DTM: string; // 수정일자
}
