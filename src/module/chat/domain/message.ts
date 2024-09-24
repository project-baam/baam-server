import { MessageType } from './enums/message-type';

export class Message {
  /**
   * id
   * 신고 기능에 사용 TODO: 하려했는데
   * 현재 서버에서는 읽으면 즉시 메시지를 삭제하기 때문에
   * 추후 고려 예정( 우선 신고는 프론트에서 전달한 그대로 서버 검증 없이 리포팅)
   */
  // id: number;
  type: MessageType;
  sender: {
    id: number;
    name: string;
    profileImageUrl?: string | null;
  } | null; // system 타입 메시지일 경우 sender 가 null
  content?: string | null;
  file?: {
    url: string;
    name: string;
    size: number;
    expiredAt?: Date;
  } | null;
  sentAt: Date;
}
