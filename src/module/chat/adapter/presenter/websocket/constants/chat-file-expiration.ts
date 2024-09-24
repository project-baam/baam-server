import dayjs from 'dayjs';
import { CHAT_ALLOWED_IMAGE_EXTENSIONS } from './chat-allowed-file';

// 이미지 파일은 7일, 그 외 파일은 21일 동안 저장
export const IMAGE_EXPIRATION_DAYS = 7;
export const OTHER_FILE_EXPIRATION_DAYS = 21;

/**
 * 파일 확장자에 따라 파일의 만료일을 반환
 */
export const getExpirationDate = (fileExtension: string): Date => {
  const expirationDays = CHAT_ALLOWED_IMAGE_EXTENSIONS.includes(fileExtension)
    ? IMAGE_EXPIRATION_DAYS
    : OTHER_FILE_EXPIRATION_DAYS;

  return dayjs().add(expirationDays, 'day').toDate();
};
