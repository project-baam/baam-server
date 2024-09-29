import { UserTimetableRepository } from 'src/module/timetable/application/repository/user-timetable.repository.abstract';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';
import { ChatRoomRepository } from 'src/module/chat/application/port/chat-room.repository.abstract';
import { TimetableService } from './../../timetable/application/timetable.service';
import { FriendService } from 'src/module/friend/application/friend.service';
import { UserProfileEntity } from 'src/module/user/adapter/persistence/orm/entities/user-profile.entity';
import { UserTimetableEntity } from 'src/module/timetable/adapter/persistence/orm/entities/user-timetable.entity';
import { ChatRoomEntity } from '../adapter/persistence/orm/entities/chat-room.entity';
import { Participant } from '../domain/participant';
import { ContentNotFoundError } from 'src/common/types/error/application-exceptions';
import { plainToInstance } from 'class-transformer';
import { UserEntity } from 'src/module/user/adapter/persistence/orm/entities/user.entity';
import {
  ClassSchedule,
  SubjectSchedule,
} from '../domain/types/subject-chatroom-name.types';
import { CommonSubjects } from 'src/module/school-dataset/domain/constants/common-subjects';
import { ChatRoomType } from '../domain/enums/chat-room-type';
import { Semester } from 'src/module/school-dataset/domain/value-objects/semester';
import { UserRepository } from 'src/module/user/application/port/user.repository.abstract';
import { CHAT_ROOM_MAX_PARTICIPANTS } from '../domain/constants/chat.constants';
import { ReportProvider } from 'src/common/provider/report.provider';
import { SubjectEntity } from 'src/module/school-dataset/adapter/persistence/orm/entities/subject.entity';

@Injectable()
export class ChatService {
  constructor(
    private readonly chatRoomRepository: ChatRoomRepository,
    private readonly friendService: FriendService,
    @Inject(forwardRef(() => TimetableService))
    private readonly timetableService: TimetableService,
    private readonly timetableRepository: UserTimetableRepository,
    private readonly userRepository: UserRepository,
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
      this.createOrInviteToSubjectChatRooms(user),
    ]);
  }

  // 유저의 학급 채팅방(없을 경우 생성 후 유저 초대)
  private async createOrInviteToClassChatRoom(user: UserProfileEntity) {
    const classChatRoom = await this.chatRoomRepository.findClassChatRoom({
      classId: user.classId,
    });

    if (!classChatRoom) {
      const newChatRoom = await this.chatRoomRepository.createClassChatRoom({
        name: `${user.class.grade}학년 ${user.class.name}반`,
        schoolId: user.class.schoolId,
        classId: user.classId,
      });

      await this.chatRoomRepository.saveChatRoomParticipant([
        { userId: user.userId, roomId: newChatRoom.id },
      ]);
    } else {
      // 최대 수용 인원 초과 시 초대하지 않음
      if (classChatRoom.participantsCount >= CHAT_ROOM_MAX_PARTICIPANTS) {
        ReportProvider.info(
          '최대 수용 인원 초과로 인한 학급 채팅방 초대 제한',
          {
            userId: user.userId,
            classChatRoomId: classChatRoom.id,
          },
        );
        return;
      }
      await this.chatRoomRepository.saveChatRoomParticipant([
        { userId: user.userId, roomId: classChatRoom.id },
      ]);
    }
  }

  // 유저의 과목 채팅방(없을 경우 생성 후 유저 초대)
  private async createOrInviteToSubjectChatRooms(user: UserProfileEntity) {
    // 공통 과목 제외한 시간표
    const userTimetable =
      await this.timetableService.getNonCommonSubjectsFromUserTimetable(
        user.userId,
      );
    if (!userTimetable.length) return;

    // 과목별 분반 목록
    const subjectSchedules = this.groupTimetableBySubject(userTimetable);
    const subjectSchedulesWithHash: {
      schedule: SubjectSchedule;
      scheduleHash: string;
    }[] = subjectSchedules.map((e: SubjectSchedule) => {
      return {
        schedule: e,
        scheduleHash: ChatRoomEntity.generateHash(
          user.class.schoolId,
          e[0],
          e[2],
        ),
      };
    });

    // 채팅방이 이미 존재하는 분반
    const existingChatRooms =
      await this.chatRoomRepository.findSubjectChatRoomByHashes(
        subjectSchedulesWithHash.map((e) => e.scheduleHash),
      );

    const availableExistingChatRooms = existingChatRooms.filter(
      (room) => room.participantsCount < CHAT_ROOM_MAX_PARTICIPANTS,
    );

    // 채팅방 생성할 분반
    const chatRoomsToCreate: Pick<
      ChatRoomEntity,
      'name' | 'schoolId' | 'subjectId' | 'scheduleHash'
    >[] = [];

    subjectSchedulesWithHash.forEach((e) => {
      if (
        !availableExistingChatRooms.some(
          (room) => room.scheduleHash === e.scheduleHash,
        )
      ) {
        chatRoomsToCreate.push({
          name: ChatRoomEntity.generateName(e.schedule[1], e.schedule[2]),
          schoolId: user.class.schoolId,
          subjectId: e.schedule[0],
          scheduleHash: e.scheduleHash,
        });
      }
    });

    // 새로 생성한 채팅방
    const newChatRooms =
      await this.chatRoomRepository.createSubjectChatRooms(chatRoomsToCreate);

    const allChatRoomsToInvite = [
      ...availableExistingChatRooms,
      ...newChatRooms,
    ].map((e) => {
      return {
        roomId: e.id,
        userId: user.userId,
      };
    });

    await this.chatRoomRepository.saveChatRoomParticipant(allChatRoomsToInvite);
  }

  private groupTimetableBySubject(
    timetable: UserTimetableEntity[],
  ): SubjectSchedule[] {
    const subjectMap = new Map<number, [string, ClassSchedule]>();

    for (const entry of timetable) {
      const { subjectId, subject, day, period } = entry;
      if (!subjectMap.has(subjectId)) {
        subjectMap.set(subjectId, [subject.name, []]);
      }

      const [, schedule] = subjectMap.get(subjectId)!;
      schedule.push({ day, period });
    }

    return Array.from(subjectMap, ([subjectId, [name, schedule]]) => [
      subjectId,
      name,
      schedule,
    ]);
  }

  @Transactional()
  async handleSchoolInfoChange(user: UserProfileEntity, oldClassId: number) {
    await this.chatRoomRepository.removeUserFromClassChatRoom(
      user.userId,
      oldClassId,
    );
    await this.createOrInviteToClassChatRoom(user);

    // TODO: oldClassId 에 해당하는 유저가 아무도 없을 경우 채팅방 삭제(어디서?)
  }

  @Transactional()
  async handleTimetableChange(
    userId: number,
    year: number,
    semester: Semester,
    subject: SubjectEntity,
  ) {
    // 공통과목은 분반 톡방 생성 생략
    if (CommonSubjects.includes(subject.name)) {
      return;
    }
    const subjectId = subject.id;

    const schoolId = (await this.userRepository.findOneById(userId))?.profile
      .class.schoolId;

    if (schoolId) {
      const updatedSubjectTimetable =
        await this.timetableRepository.findUserTimetableBySubject({
          userId,
          year,
          semester,
          subjectId,
        });

      const newScheduleHash = ChatRoomEntity.generateHash(
        schoolId,
        subjectId,
        updatedSubjectTimetable,
      );

      // 현재 사용자가 속한 변경된 과목의 채팅방 조회
      const currentRooms =
        await this.chatRoomRepository.findSubjectChatRoomsByUserIdAndSubjectId(
          userId,
          subjectId,
        );

      if (currentRooms.length) {
        for (const currentRoom of currentRooms) {
          if (currentRoom.scheduleHash !== newScheduleHash) {
            // 기존 방에서 나가기
            await this.chatRoomRepository.removeUserFromSubjectChatRooms(
              userId,
              [currentRoom.scheduleHash],
            );

            // 해당 방의 참가자 수가 0이면 방 삭제
            if (currentRoom.participantsCount - 1 === 0) {
              await this.chatRoomRepository.deleteChatRooms([currentRoom.id]);
            }
          }
        }
      }

      // 해당 과목의 수업 조합(분반) 채팅방 찾기 또는 생성
      if (updatedSubjectTimetable.length) {
        let targetRoom =
          await this.chatRoomRepository.findSubjectChatRoomByHashes([
            newScheduleHash,
          ]);

        if (!targetRoom.length) {
          // 새 방 생성
          const subjectName = subject.name;
          targetRoom = await this.chatRoomRepository.createSubjectChatRooms([
            {
              name: ChatRoomEntity.generateName(
                subjectName,
                updatedSubjectTimetable,
              ),
              schoolId,
              subjectId,
              scheduleHash: newScheduleHash,
            },
          ]);
        } else {
          if (targetRoom[0].participantsCount >= CHAT_ROOM_MAX_PARTICIPANTS) {
            ReportProvider.info(
              '채팅방 최대 수용 인원 초과로 인한 채팅방 참가 제한',
              {
                userId,
                chatRoomId: targetRoom[0].id,
              },
            );
            return;
          }
        }
        // 채팅방에 초대
        await this.chatRoomRepository.saveChatRoomParticipant([
          { userId, roomId: targetRoom[0].id },
        ]);
      }
    }
  }

  async ensureUserHasChatRooms(user: UserProfileEntity): Promise<void> {
    const { classChatRoomCount, subjectChatRoomCount } =
      await this.chatRoomRepository.countChatRoomsForUser(user.userId);

    const userTimetable =
      await this.timetableService.getNonCommonSubjectsFromUserTimetable(
        user.userId,
      );

    const expectedSubjectCount = new Set(
      userTimetable.map((entry) => entry.subjectId),
    ).size;

    const needsInitialization =
      classChatRoomCount === 0 || subjectChatRoomCount < expectedSubjectCount;

    if (needsInitialization) {
      await this.initializeChatRoomsForUser(user);
    } else if (subjectChatRoomCount > expectedSubjectCount) {
      // 옵션: 필요 없는 과목 채팅방에서 사용자 제거
      await this.removeUserFromUnnecessarySubjectRooms(user, userTimetable);
    }
  }

  private async removeUserFromUnnecessarySubjectRooms(
    user: UserProfileEntity,
    currentTimetable: UserTimetableEntity[],
  ): Promise<void> {
    const currentSubjectIds = new Set(
      currentTimetable.map((entry) => entry.subjectId),
    );
    const userChatRooms = await this.chatRoomRepository.findUserChatRooms(
      user.userId,
    );

    // 시간표에는 없는데 채팅방에 있는 과목 채팅방
    const unnecessaryRooms = userChatRooms.filter(
      (room) =>
        room.type === ChatRoomType.SUBJECT &&
        !currentSubjectIds.has(room.subjectId),
    );

    if (unnecessaryRooms.length > 0) {
      await this.chatRoomRepository.removeUserFromSubjectChatRooms(
        user.userId,
        unnecessaryRooms.map((room) => room.scheduleHash),
      );
    }
  }

  async getUserChatRooms(user: UserEntity) {
    await this.ensureUserHasChatRooms(user.profile);
    const chatRooms = await this.chatRoomRepository.getUserChatRooms(user.id);

    return chatRooms;
  }

  async isUserInChatRoomOrFail(userId: number, roomId: string): Promise<void> {
    const isUserInChatRoom = await this.chatRoomRepository.isUserInChatRoom(
      userId,
      roomId,
    );

    if (!isUserInChatRoom) {
      throw new ContentNotFoundError('chatroom-user', `${roomId}-${userId}`);
    }
  }

  async getChatRoomParticipants(
    userId: number,
    roomId: string,
  ): Promise<Participant[]> {
    await this.chatRoomRepository.findChatRoomByIdOrFail(roomId);
    if (!(await this.chatRoomRepository.isUserInChatRoom(userId, roomId))) {
      throw new ContentNotFoundError('chatroom-user', `${roomId}-${userId}`);
    }

    const participants =
      await this.chatRoomRepository.getChatRoomParticipants(roomId);

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
