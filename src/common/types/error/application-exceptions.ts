import { ErrorCode } from 'src/common/constants/error-codes';
import { ApplicationException } from './application-exceptions.base';
import { SignInProvider } from 'src/module/iam/domain/enums/sign-in-provider.enum';
import { PROFILE_IMAGE_FIELDS } from 'src/module/user/adapter/presenter/rest/constants/profile-image.constants';

export class ContentNotFoundError extends ApplicationException {
  constructor(resource: string = '$resource', id: string | number = '$id') {
    const message = `${resource} #${id} not found`;
    super(ErrorCode.ContentNotFound, message);
  }
}

export class DuplicateValueError extends ApplicationException {
  constructor(
    resource: string = '$resource',
    property: string = '$property',
    value: string | number = '$value',
  ) {
    const message = `Duplicate *${property}* for *${resource}*: *${value}*`;
    super(ErrorCode.DuplicateValue, message);
  }
}

export class MissingAuthTokenError extends ApplicationException {
  constructor() {
    super(
      ErrorCode.MissingAuthToken,
      'Access token is missing in the request header.',
    );
  }
}

export class InvalidAccessTokenError extends ApplicationException {
  constructor() {
    super(ErrorCode.InvalidAccessToken, 'Invalid Access Token');
  }
}

export class InvalidatedRefreshTokenError extends ApplicationException {
  constructor() {
    super(
      ErrorCode.InvalidRefreshToken,
      'Access denied. Your refresh token might have been stolen',
    );
  }
}

export class IncorrectLoginInfo extends ApplicationException {
  constructor() {
    super(
      ErrorCode.IncorrectLoginInfo,
      'The email address or password is incorrect',
    );
  }
}

export class NeisError extends ApplicationException {
  constructor(message?: string) {
    super(ErrorCode.NeisError, message);
  }
}

export class SocialAuthenticationError extends ApplicationException {
  constructor(provider: SignInProvider, details?: string) {
    const message = `Authentication failed with ${provider}. ${details || ''}`;
    super(ErrorCode.SocialAuthenticationFailed, message);
  }
}

export class IncompleteProfileError extends ApplicationException {
  constructor() {
    super(ErrorCode.IncompleteProfile, '필수 프로필 정보 누락');
  }
}

export class InvalidFileNameExtensionError extends ApplicationException {
  constructor(fileType: string = '$fileType') {
    super(
      ErrorCode.InvalidFileNameExtension,
      `허용하지 않는 파일 형식: ${fileType}`,
    );
  }
}

export class InvalidFileNameCharatersError extends ApplicationException {
  constructor() {
    super(ErrorCode.InvalidFilenameCharacters, '파일명 invalid');
  }
}

export class InvalidFileSizeError extends ApplicationException {
  constructor() {
    super(ErrorCode.InvalidFileSize, '파일 크기 초과');
  }
}

export class MissingRequiredFieldsError extends ApplicationException {
  constructor(properties: string[] = [], message: string = '필수 필드 누락') {
    super(
      ErrorCode.MissingRequiredFields,
      message ??
        `Missing required fields:[ ${properties?.join(', ')}] must all be provided together.`,
    );
  }
}

export class UnexpectedFieldsError extends ApplicationException {
  constructor(
    unexpectedFields: string[] = [],
    message: string = '없어야하는 필드가 포함되어 있음',
  ) {
    super(
      ErrorCode.UnexpectedFields,
      message ??
        'The following fields are not allowed: ' + unexpectedFields?.join(', '),
    );
  }
}

export class UnauthorizedSubjectAccessError extends ApplicationException {
  constructor(subject: string) {
    super(
      ErrorCode.UnauthorizedSubjectAccess,
      `[${subject}] 과목을 수강하고 있지 않음`,
    );
  }
}

export class InvalidProfileImageFieldError extends ApplicationException {
  constructor(field: string) {
    super(
      ErrorCode.InvalidProfileImageField,
      `Invalid profile image field: ${field}. Expected ${PROFILE_IMAGE_FIELDS.PROFILE} or ${PROFILE_IMAGE_FIELDS.BACKGROUND}.`,
    );
  }
}

export class AlreadyFriendsError extends ApplicationException {
  constructor(
    userId: number | string = '$userId',
    friendId: number | string = '$friendId',
  ) {
    const message = `유저 ${userId} 와 ${friendId} 는 이미 친구 사이이다.`;
    super(ErrorCode.AlreadyFriends, message);
  }
}

export class SelfFriendRequestError extends ApplicationException {
  constructor(userId: number | string = `$userId`) {
    const message = `자기자신에게 친구 요청 불가. User ID: ${userId}`;
    super(ErrorCode.SelfFriendRequest, message);
  }
}

export class DuplicateFriendRequestError extends ApplicationException {
  constructor(
    senderId: number | string = '$senderId',
    receiverId: number | string = '$receiverId',
  ) {
    const message = `대기중인 친구 요청이 이미 존재, 받는이: #${receiverId} 보낸이:  #${senderId}`;
    super(ErrorCode.DuplicateFriendRequest, message);
  }
}

export class SchoolTimeNotSetError extends ApplicationException {
  constructor() {
    super(
      ErrorCode.SchoolTimeNotSet,
      '1교시 시작 시간, 점심 시간 시작/종료 시간 입력해야 시간표 기능 이용 가능',
    );
  }
}
export class MalformedDevicePushTokenError extends ApplicationException {
  constructor() {
    super(ErrorCode.MalformedDevicePushToken, '잘못된 Device Push Token 포맷');
  }
}

export class NotificationAlreadyRead extends ApplicationException {
  constructor() {
    super(ErrorCode.NotificationAlreadyRead, '이미 읽은 알림');
  }
}

// 유저가 해당 채팅방에 온라인 상태가 아닌 경우
export class UserNotOnlineInRoomError extends ApplicationException {
  constructor(roomId: string = '$roomid', userId: string | number = '$userId') {
    super(
      ErrorCode.UserNotOnlineInRoom,
      `유저(${userId})가 해당 채팅방(${roomId}) 온라인 상태가 아님`,
    );
  }
}
