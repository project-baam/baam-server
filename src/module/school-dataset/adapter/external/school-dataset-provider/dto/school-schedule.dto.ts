import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { NeisBaseRequestDto } from './base.dto';

export class SchoolScheduleRequest extends NeisBaseRequestDto {
  @IsNotEmpty()
  @IsString()
  ATPT_OFCDC_SC_CODE: string; // 시도교육청코드

  @IsNotEmpty()
  @IsString()
  SD_SCHUL_CODE: string; // 행정표준코드

  @IsString()
  @IsOptional()
  DGHT_CRSE_SC_NM?: string; // 주야과정명

  @IsString()
  @IsOptional()
  SCHUL_CRSE_SC_NM?: string; // 학교과정명

  @IsString()
  @IsOptional()
  AA_YMD?: string; // 학사일자

  @IsString()
  @IsOptional()
  AA_FROM_YMD?: string; // 학사시작일자

  @IsString()
  @IsOptional()
  AA_TO_YMD?: string; // 학사종료일자
}

export interface SchoolSchedule {
  ATPT_OFCDC_SC_CODE: string; // 시도교육청코드
  ATPT_OFCDC_SC_NM: string; // 시도교육청명
  SD_SCHUL_CODE: string; // 행정표준코드
  SCHUL_NM: string; // 학교명
  AY: string; // 학년도
  DGHT_CRSE_SC_NM: string; // 주야과정명
  SCHUL_CRSE_SC_NM: string; // 학교과정명
  SBTR_DD_SC_NM: string; // 수업공제일명
  AA_YMD: string; // 학사일자
  EVENT_NM: string; // 행사명
  EVENT_CNTNT: string; // 행사내용
  ONE_GRADE_EVENT_YN: string; // 1학년행사여부
  TW_GRADE_EVENT_YN: string; // 2학년행사여부
  THREE_GRADE_EVENT_YN: string; // 3학년행사여부
  FR_GRADE_EVENT_YN: string; // 4학년행사여부
  FIV_GRADE_EVENT_YN: string; // 5학년행사여부
  SIX_GRADE_EVENT_YN: string; // 6학년행사여부
  LOAD_DTM: string; // 수정일자
}
