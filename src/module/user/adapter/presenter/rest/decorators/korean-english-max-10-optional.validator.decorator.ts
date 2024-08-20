import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsOptionalKoreanEnglishMax10(
  validationOptions?: ValidationOptions,
) {
  return function (target: Record<string, any>, propertyName: string): void {
    registerDecorator({
      name: 'isOptionalKoreanEnglishMax10',
      target: target.constructor,
      propertyName: propertyName,
      options: {
        message: (args: ValidationArguments) =>
          `${args.property}는 비어있거나, 한글과 영문만 허용되며 공백 없이 최대 10글자까지 입력 가능합니다.`,
        ...validationOptions,
      },
      validator: {
        validate(value: unknown): boolean {
          // 값이 없거나 빈 문자열이면 유효한 것으로 간주
          if (value === undefined || value === null || value === '') {
            return true;
          }
          if (typeof value !== 'string') {
            return false;
          }
          const regex = /^[가-힣a-zA-Z]{1,10}$/;
          return regex.test(value);
        },
      },
    });
  };
}
