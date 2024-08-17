import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { NeisBaseRequestDto } from './base.dto';
import { NeisMealType } from '../constants/neis';

export class MealInfoRequest extends NeisBaseRequestDto {
  @IsNotEmpty()
  @IsString()
  ATPT_OFCDC_SC_CODE: string; // 시도교육청코드

  @IsNotEmpty()
  @IsString()
  SD_SCHUL_CODE: string; // 행정표준코드

  @IsOptional()
  @IsEnum(NeisMealType)
  MMEAL_SC_CODE?: NeisMealType; // 식사코드

  @IsOptional()
  @IsString()
  MLSV_YMD?: string; // 급식일자 (YYYYMMDD)

  @IsOptional()
  @IsString()
  MLSV_FROM_YMD?: string; // 급식일자 (시작일자)

  @IsOptional()
  @IsString()
  MLSV_TO_YMD?: string; // 급식일자 (종료일자)
}

export interface MealInfo {
  ATPT_OFCDC_SC_CODE: string; // 시도교육청코드
  ATPT_OFCDC_SC_NM: string; // 시도교육청명
  SD_SCHUL_CODE: string; // 행정표준코드
  SCHUL_NM: string; // 학교명
  MMEAL_SC_CODE: NeisMealType; // 식사코드
  MLSV_YMD: string; // 급식일자
  MLSV_FGR: string; // 급식인원수
  DDISH_NM: string; // 요리명
  ORPLC_INFO: string; // 원산지정보
  CAL_INFO: string; // 열량정보
  NTR_INFO: string; // 영양정보
  MLSV_FROM_YMD: string; // 급식일자 (시작일자)
  MLSV_TO_YMD: string; // 급식일자 (종료일자)
  LOAD_DTM: string; // 수정일자
}
