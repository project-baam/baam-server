import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import {
  USER_NAME_MAX_ENGLISH_LENGTH,
  USER_NAME_MAX_KOREAN_LENGTH,
} from 'src/module/user/domain/constants/user-name-max-length';

export function IsOptionalKoreanEnglishMaxLength(
  validationOptions?: ValidationOptions,
) {
  return function (target: Record<string, any>, propertyName: string): void {
    registerDecorator({
      name: 'isOptionalKoreanEnglishMaxLength',
      target: target.constructor,
      propertyName: propertyName,
      options: {
        message: (args: ValidationArguments) =>
          `${args.property}는 비어있거나, 한글은 최대 ${USER_NAME_MAX_KOREAN_LENGTH}자, 영문은 최대 ${USER_NAME_MAX_ENGLISH_LENGTH}자까지 입력 가능, 공백 허용`,
        ...validationOptions,
      },
      validator: {
        validate(value: unknown): boolean {
          // optional
          if (value === undefined || value === null || value === '') {
            return true;
          }
          if (typeof value !== 'string') {
            return false;
          }

          const koreanRegex = new RegExp(
            `^[가-힣\\s]{1,${USER_NAME_MAX_KOREAN_LENGTH}}$`,
          );
          const englishRegex = new RegExp(
            `^[a-zA-Z\\s]{1,${USER_NAME_MAX_ENGLISH_LENGTH}}$`,
          );

          return koreanRegex.test(value) || englishRegex.test(value);
        },
      },
    });
  };
}
