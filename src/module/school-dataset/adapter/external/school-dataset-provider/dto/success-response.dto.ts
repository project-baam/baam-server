import { NeisCategory, NeisSuccessCode } from '../constants/neis';

export type ResponseDataDto<T> = {
  [key in NeisCategory]: [
    {
      head: [
        { list_total_count: number },
        {
          RESULT: {
            CODE: NeisSuccessCode;
            MESSAGE: string;
          };
        },
      ];
    },
    {
      row: T[];
    },
  ];
};
