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
  return (
    VALID_KOREAN_INITIALS.includes(initial) ||
    (initial.length === 1 && initial >= 'A' && initial <= 'Z')
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
