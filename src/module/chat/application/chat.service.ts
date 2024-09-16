import { DateUtilService } from 'src/module/util/date-util.service';
import { TimetableService } from './../../timetable/application/timetable.service';
import { FriendService } from 'src/module/friend/application/friend.service';
import { Injectable } from '@nestjs/common';
import { ChatRepository } from './port/chat.repository.abstract';
import { plainToInstance } from 'class-transformer';
import { Participant } from '../domain/participant';
import { ContentNotFoundError } from 'src/common/types/error/application-exceptions';
import { UserProfileEntity } from 'src/module/user/adapter/persistence/orm/entities/user-profile.entity';
import { UserEntity } from 'src/module/user/adapter/persistence/orm/entities/user.entity';
import { Transactional } from 'typeorm-transactional';
import { UserTimetableEntity } from 'src/module/timetable/adapter/persistence/entities/user-timetable.entity';

@Injectable()
export class ChatService {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly friendService: FriendService,
    private readonly timetableService: TimetableService,
    private readonly dateUtilService: DateUtilService,
  ) {}

  /**
   *  유저 채팅방 초기화: 학급 채팅방, 과목 채팅방 생성 및 초대
   * 시간표에 대한 과목 채팅방은 공통 과목을 제외하고 생성
   * @param user
   */
  @Transactional()
  async initializeChatRoomsForUser(user: UserProfileEntity) {
    await Promise.all([
      this.createOrInviteToClassChatRoom(user),
      this.createOrInviteToSubjectChatRoom(user),
    ]);
  }

  // 유저의 학급 채팅방(없을 경우 생성 후 유저 초대)
  private async createOrInviteToClassChatRoom(user: UserProfileEntity) {
    const classChatRoom = await this.chatRepository.findClassChatRoom({
      classId: user.classId,
    });

    if (!classChatRoom) {
      // 채팅방 생성
      const newChatRoom = await this.chatRepository.createClassChatRoom({
        name: `${user.class.grade}학년 ${user.class.name}반`,
        schoolId: user.class.schoolId,
        classId: user.classId,
      });

      // 채팅방 초대
      this.chatRepository.saveChatRoomParticipant([
        { userId: user.userId, roomId: newChatRoom.id },
      ]);
    } else {
      // 채팅방 초대
      await this.chatRepository.saveChatRoomParticipant([
        { userId: user.userId, roomId: classChatRoom.id },
      ]);
    }
  }

  // 유저의 과목 채팅방(없을 경우 생성 후 유저 초대)
  private async createOrInviteToSubjectChatRoom(user: UserProfileEntity) {
    // 공통 과목은 채팅방 생성 안 함
    const userTimetable =
      await this.timetableService.getNonCommonSubjectsFromUserTimetable(
        user.userId,
      );

    // 모든 가능한 채팅방을 한 번에 조회
    const existingChatRooms =
      await this.chatRepository.findSubjectChatRoomsByTimetable({
        schoolId: user.class.schoolId,
        timetables: userTimetable,
      });

    const chatRoomsToCreate = userTimetable
      .filter(
        (timetable) =>
          !existingChatRooms.some(
            (room) =>
              room.subjectId === timetable.subjectId &&
              room.day === timetable.day &&
              room.period === timetable.period,
          ),
      )
      .map((timetable) => ({
        name: `[${timetable.subject.name}] (${this.dateUtilService.getKoreanWeekday(timetable.day)} ${timetable.period} 교시) `,
        schoolId: user.class.schoolId,
        subjectId: timetable.subjectId,
        day: timetable.day,
        period: timetable.period,
      }));

    const newChatRooms =
      await this.chatRepository.createSubjectChatRooms(chatRoomsToCreate);

    const allChatRoomIds = [
      ...existingChatRooms.map((r) => r.id),
      ...newChatRooms.map((r) => r.id),
    ];

    await this.chatRepository.saveChatRoomParticipant(
      allChatRoomIds.map((id) => ({ roomId: id, userId: user.userId })),
    );
  }

  @Transactional()
  async handleSchoolInfoChange(user: UserProfileEntity, oldClassId: number) {
    await this.chatRepository.removeUserFromClassChatRoom(
      user.userId,
      oldClassId,
    );
    await this.createOrInviteToClassChatRoom(user);

    // TODO: oldClassId 에 해당하는 유저가 아무도 없을 경우 채팅방 삭제(어디서?)
  }

  // TODO: :
  async handleTimetableChange(
    user: UserProfileEntity,
    oldTimetable: UserTimetableEntity[],
    newTimetable: UserTimetableEntity[],
  ) {
    // await this.createOrInviteToSubjectChatRoom(user);
  }

  async ensureUserHasChatRooms(user: UserProfileEntity): Promise<void> {
    const chatRoomsCount = await this.chatRepository.countChatRoomsForUser(
      user.userId,
    );

    if (!chatRoomsCount) {
      await this.initializeChatRoomsForUser(user);
    }
  }

  async getUserChatRooms(user: UserEntity) {
    await this.ensureUserHasChatRooms(user.profile);
    return this.chatRepository.getUserChatRooms(user.id);
  }

  async getChatRoomParticipants(
    userId: number,
    roomId: string,
  ): Promise<Participant[]> {
    await this.chatRepository.findChatRoomByIdOrFail(roomId);
    if (!(await this.chatRepository.isUserInChatRoom(userId, roomId))) {
      throw new ContentNotFoundError('chatroom-user', `${roomId}-${userId}`);
    }

    const participants =
      await this.chatRepository.getChatRoomParticipants(roomId);

    return (await this.friendService.addFriendsActiveClass(participants)).map(
      (e) => {
        return plainToInstance(
          Participant,
          {
            ...e.friend.user,
            profileImage: e.friend.user.profileImageUrl,
            activeClassNow: e.activeClassNow,
          },
          { excludeExtraneousValues: true },
        );
      },
    );
  }
}
