export class ResponseListDto<T> {
  total: number;
  list: Array<T>;

  constructor(list: Array<T> | null, total?: number) {
    this.total = total ? total : list ? list.length : 0;
    this.list = list || [];
  }
}
