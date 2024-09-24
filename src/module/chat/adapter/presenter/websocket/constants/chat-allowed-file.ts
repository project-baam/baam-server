export const CHAT_ALLOWED_FILE_EXTENSION =
  /\.(jpg|jpeg|png|mp4|mov|avi|wmv|pdf)$/i;

export const CHAT_ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png'];
export const CHAT_ALLOWED_VIDEO_OR_DOCUMENT_EXTENSIONS = [
  'mp4',
  'mov',
  'avi',
  'wmv',
  'pdf',
];

export const CHAT_ALLOWED_FILENAME_CHARACTERS_REGEX = /^[\p{L}\p{N}._\s-]+$/u;

const MAX_IMAGE_FILE_SIZE_MB = 5;
const MAX_VIDEO_OR_DOCUMENT_FILE_SIZE_MB = 25;

export const MAX_IMAGE_FILE_SIZE_BYTES = MAX_IMAGE_FILE_SIZE_MB * 1024 * 1024;
export const MAX_VIDEO_OR_DOCUMENT_FILE_SIZE_BYTES =
  MAX_VIDEO_OR_DOCUMENT_FILE_SIZE_MB * 1024 * 1024;
