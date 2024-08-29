import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

const VALID_KOREAN_INITIALS = [
  'ㄱ',
  'ㄲ',
  'ㄴ',
  'ㄷ',
  'ㄸ',
  'ㄹ',
  'ㅁ',
  'ㅂ',
  'ㅃ',
  'ㅅ',
  'ㅆ',
  'ㅇ',
  'ㅈ',
  'ㅉ',
  'ㅊ',
  'ㅋ',
  'ㅌ',
  'ㅍ',
  'ㅎ',
];

function isValidInitial(initial: string): boolean {
  // URL 디코딩 수행
  const decodedInitial = decodeURIComponent(initial);
  // 제어 문자 제거
  const cleanedInitial = decodedInitial.replace(/[\x00-\x1F\x7F]/g, '');

  // 정제된 문자열이 비어있다면 유효하지 않음
  if (cleanedInitial.length === 0) {
    return false;
  }

  return (
    VALID_KOREAN_INITIALS.includes(decodedInitial) ||
    (decodedInitial.length === 1 &&
      decodedInitial >= 'A' &&
      decodedInitial <= 'Z')
  );
}

export function IsValidInitial(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidInitial',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        validate(value: any, _args: ValidationArguments) {
          if (Array.isArray(value)) {
            return value.every((item) => isValidInitial(item));
          }
          return isValidInitial(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be valid Korean initials or uppercase English letters`;
        },
      },
    });
  };
}
