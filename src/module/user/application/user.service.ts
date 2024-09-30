import { Period } from 'src/module/timetable/domain/enums/period';
import { ChatService } from 'src/module/chat/application/chat.service';
// inbound port

import { FindUniqueUserQuery } from './dto/user.query';
import { UserRepository } from './port/user.repository.abstract';
import { Inject } from '@nestjs/common';
import { UserEntity } from '../adapter/persistence/orm/entities/user.entity';
import { UserMapper } from '../adapter/presenter/rest/mappers/user.mapper';
import { User } from './../domain/user';
import { UpdateProfileRequest } from '../adapter/presenter/rest/dto/user.dto';
import { SchoolRepository } from 'src/module/school-dataset/application/port/school.repository.abstract';
import { ClassRepository } from 'src/module/school-dataset/application/port/class.repository.abstract';
import { UserStatus } from '../domain/enum/user-status.enum';
import { ObjectStorageService } from 'src/module/object-storage/application/object-storage.service.abstract';
import { StorageCategory } from 'src/module/object-storage/domain/enums/storage-category.enum';
import { SupportedEnvironment } from 'src/config/environment/environment';
import { MissingRequiredFieldsError } from 'src/common/types/error/application-exceptions';
import { CalendarService } from 'src/module/calendar/application/calendar.service';
import { TimetableService } from 'src/module/timetable/application/timetable.service';
import { EnvironmentService } from 'src/config/environment/environment.service';
import { PROFILE_IMAGE_FIELDS } from '../adapter/presenter/rest/constants/profile-image.constants';
import { Transactional } from 'typeorm-transactional';
import { SignInProvider } from 'src/module/iam/domain/enums/sign-in-provider.enum';
import { ReportProvider } from 'src/common/provider/report.provider';
import { UserGrade } from 'src/module/school-dataset/domain/value-objects/grade';
import { Weekday } from 'src/module/timetable/domain/enums/weekday';
import { TimetableCacheStorage } from 'src/module/timetable/adapter/persistence/in-memory/timetable-cache.storage';

export class UserService {
  constructor(
    @Inject(UserRepository)
    private readonly userRepository: UserRepository,
    private readonly schoolRepository: SchoolRepository,
    private readonly classRepository: ClassRepository,
    private readonly objectStorageService: ObjectStorageService,
    private readonly environmentService: EnvironmentService,
    private readonly timetableService: TimetableService,
    private readonly calendarService: CalendarService,
    private readonly chatService: ChatService,
    private readonly timetableCacheStorage: TimetableCacheStorage,
  ) {}

  async insertTestUser(schoolId: number) {
    await this.schoolRepository.findByIdOrFail(schoolId);
    const userNames = [
      '고등어',
      '도미',
      '연어',
      '참치',
      '다랑어',
      '금붕어',
      '가자미',
      '도다리',
      '갈치',
      '광어',
      '꽁치',
      '꼴뚜기',
      '해삼',
      '전어',
      '전갱이',
      '조기',
      '쥐포',
      '쥐치',
      '쪽파',
      '참다랑어',
    ];

    const userNamesEn = [
      'Mackerel',
      'Sea Bream',
      'Salmon',
      'Tuna',
      'Albacore',
      'Goldfish',
      'Flounder',
      'Sole',
      'Hairtail',
      'Flatfish',
      'Pacific Saury',
      'Small Squid',
      'Sea Cucumber',
      'Gizzard Shad',
      'Horse Mackerel',
      'Yellow Croaker',
      'Dried Filefish',
      'Filefish',
      'Scallion',
      'Bluefin Tuna',
    ];

    const subjects = [
      '무역 금융 업무',
      '전자 상거래 실무',
      '인사',
      '비서',
      '예산﹒자금',
      '세무 실무',
      '구매 조달',
      '공정 관리',
      '품질 관리',
      '수출입 관리',
      '창구 사무',
      '고객 관리',
      '매장 판매',
      '인간 발달',
      '보육 원리와 보육 교사',
      '보육 과정',
      '아동 생활 지도',
      '아동 복지',
      '보육 실습',
      '영유아 교수 방법',
      '생활 서비스 산업의 이해',
      '복지 서비스의 기초',
      '사회 복지 시설의 이해',
      '공중 보건',
      '인체 구조와 기능',
      '간호의 기초',
      '기초 간호 임상 실무',
      '보건 간호',
      '보건 의료 법규',
      '치과 간호 임상 실무',
      '영유아 건강⋅안전⋅영양 지도',
      '영유아 놀이 지도',
      '사회 복지 시설 실무',
      '대인 복지 서비스',
      '요양 지원',
      '문화 콘텐츠 산업 일반',
      '미디어 콘텐츠 일반',
      '영상 제작 기초',
      '애니메이션 기초',
      '음악 콘텐츠 제작 기초',
      '디자인 제도',
      '디자인 일반',
      '조형',
      '색채 일반',
      '컴퓨터 그래픽',
      '공예 일반',
      '공예 재료와 도구',
      '방송 일반',
      '영화 콘텐츠 제작',
      '광고 콘텐츠 제작',
      '게임 디자인',
      '애니메이션 콘텐츠 제작',
      '캐릭터 제작',
      'VR⋅AR 콘텐츠 제작',
      '제품 디자인',
      '실내 디자인',
      '편집 디자인',
      '목공예',
      '방송 콘텐츠 제작',
      '음악 콘텐츠 제작',
      '게임 기획',
      '게임 프로그래밍',
      '만화 콘텐츠 제작',
      '스마트 문화 앱 콘텐츠 제작',
      '시각 디자인',
      '디지털 디자인',
      '색채 디자인',
      '도자기 공예',
      '금속 공예',
      '방송 제작 시스템 운용',
      '미용의 기초',
      '미용 안전⋅보건',
      '헤어 미용',
      '메이크업',
      '피부 미용',
      '네일 미용',
      '관광 일반',
      '관광 서비스',
      '관광 영어',
      '관광 일본어',
      '관광 중국어',
      '관광 문화와 자원',
      '관광 콘텐츠 개발',
      '전시⋅컨벤션⋅이벤트 일반',
      '레저 서비스 일반',
      '호텔 식음료 서비스 실무',
      '호텔 객실 서비스 실무',
      '국내 여행 서비스 실무',
      '전시⋅컨벤션⋅이벤트 실무',
      '국외 여행 서비스 실무',
      '카지노 서비스 실무',
      '식품과 영양',
      '기초 조리',
      '디저트 조리',
      '식음료 기초',
      '식품 과학',
      '식품 위생',
      '식품 가공 기술',
      '식품 분석',
      '한식 조리',
      '중식 조리',
      '바리스타',
      '식공간 연출',
      '축산 식품 가공',
      '건강 기능 식품 가공',
      '음료⋅주류 가공',
      '떡 제조',
      '제빵',
      '양식 조리',
      '일식 조리',
      '바텐더',
      '수산 식품 가공',
      '유제품 가공',
      '김치⋅반찬 가공',
      '식품 품질 관리',
      '제과',
      '공업 일반',
      '기초 제도',
      '건축 일반',
      '건축 기초 실습',
      '건축 도면 해석과 제도',
      '토목 일반',
      '토목 도면 해석과 제도',
      '건설 재료',
      '역학 기초',
      '토질⋅수리',
      '측량 기초',
      '드론 기초',
      '스마트 시티 기초',
      '건물 정보 관리 기초',
      '철근 콘크리트 시공',
      '건축 마감 시공',
      '건축 설계',
      '토목 시공',
      '측량',
      '공간 정보 융합 서비스',
      '국토 도시 계획',
      '주거 서비스',
      '건축 목공 시공',
      '건축 도장 시공',
      '토목 설계',
      '지적',
      '공간 정보 구축',
      '소형 무인기 운용⋅조종',
      '교통 계획⋅설계',
      '기계 제도',
      '기계 기초 공작',
      '전자 기계 이론',
      '기계 일반',
      '자동차 일반',
      '기계 기초 역학',
    ];

    const classId = (await this.classRepository.findBySchoolId(schoolId))[0].id;

    for (const name of userNamesEn) {
      const providerUserId = Math.floor(Math.random() * 1000000).toString();
      await this.userRepository.insertOne({
        provider: SignInProvider.KAKAO,
        providerUserId,
        status: UserStatus.ACTIVE,
      });

      const user = await this.userRepository.findOneByProvider(
        SignInProvider.KAKAO,
        providerUserId,
      );

      await this.userRepository.upsertProfile({
        userId: user!.id,
        fullName: name,
        classId,
      });

      if (user) {
        const firstPeriodStart = user.id % 2 === 0 ? '11:00' : '12:00';
        const lunchTimeStart = user.id % 2 === 0 ? '14:00' : '15:00';
        const lunchTimeEnd = user.id % 2 === 0 ? '15:00' : '18:00';

        await this.timetableService.upsertSchoolTimeSettings(user.id, {
          firstPeriodStart,
          lunchTimeStart,
          lunchTimeEnd,
        });

        const weekdays = Object.values(Weekday).filter(
          (value) => typeof value === 'number',
        );
        const periods = Object.values(Period).filter(
          (value) => typeof value === 'number',
        );

        for (const day of weekdays) {
          for (const period of periods) {
            const randomSubject =
              subjects[Math.floor(Math.random() * subjects.length)];

            await this.timetableService.editOrAddTimetable(user!.id, {
              year: 2024,
              semester: 2,
              day,
              period,
              subjectName: randomSubject,
            });
          }
        }
      }
    }
  }

  async findUserByProviderId(
    findUniqueUserDto: FindUniqueUserQuery,
  ): Promise<UserEntity | null> {
    return await this.userRepository.findOneByProvider(
      findUniqueUserDto.provider,
      findUniqueUserDto.providerUserId,
    );
  }

  async getUserProfile(userId: number): Promise<User> {
    return UserMapper.toDomain(
      await this.userRepository.findOneByIdOrFail(userId),
    );
  }

  async upsertProfileImage(
    userId: number,
    file: Express.Multer.File,
    category: StorageCategory,
  ): Promise<string> {
    const uploadParams = {
      uniqueKey: userId,
      file,
      category,
      environment: this.environmentService.get<SupportedEnvironment>('ENV')!,
    };
    const newImgUrl = await this.objectStorageService.uploadFile(uploadParams);

    const user = await this.userRepository.findOneByIdOrFail(userId);
    if (user.profile?.profileImageUrl) {
      await this.objectStorageService.deleteFile({
        objectUrl: user.profile.profileImageUrl,
      });
    }

    return newImgUrl;
  }

  // TODO: 학교 정보 변경시, 기존 시간표, 캘린더 이벤트 삭제
  @Transactional()
  async updateProfile(
    user: UserEntity,
    params: UpdateProfileRequest,
    files: {
      [PROFILE_IMAGE_FIELDS.PROFILE]?: Express.Multer.File[];
      [PROFILE_IMAGE_FIELDS.BACKGROUND]?: Express.Multer.File[];
    },
  ): Promise<User> {
    const startTime = Date.now();
    let stepTime = startTime;

    const logStep = (stepName: string) => {
      const now = Date.now();
      console.log(`${stepName} took ${now - stepTime}ms`);
      stepTime = now;
    };

    this.validateRequiredFields(
      params.schoolId,
      params.className,
      params.grade,
    );
    logStep('Validate fields');

    const classId = await this.getClassId(
      params.schoolId,
      params.className,
      params.grade,
    );
    logStep('Get class ID');

    const imageUploadPromises = this.startImageUploads(user.id, files);
    logStep('Start image uploads');

    await this.userRepository.upsertProfile({
      userId: user.id,
      fullName: (params.fullName || user.profile?.fullName).trim(), // 변경값이 없으면 기존 값 사용, 공백 제거
      classId: classId ?? user.profile?.classId,
      isClassPublic: params.isClassPublic ?? user.profile?.isClassPublic,
      isTimetablePublic:
        params.isTimetablePublic ?? user.profile?.isTimetablePublic,
    });
    logStep('Upsert profile');

    await this.updateUserStatusIfNeeded(user.id);
    logStep('Update user status');

    const [profileImageUrl, backgroundImageUrl] =
      await Promise.all(imageUploadPromises);
    logStep('Wait for image uploads');

    if (profileImageUrl || backgroundImageUrl) {
      await this.userRepository.updateProfile(user.id, {
        profileImageUrl,
        backgroundImageUrl,
      });
      logStep('Update profile images');
    }

    const updatedUser = await this.userRepository.findOneByIdOrFail(user.id);
    logStep('Find updated user');

    // setDefaultTimetableAndCalendarEvents를 백그라운드에서 실행
    if (classId) {
      this.setDefaultTimetableAndCalendarEventsInBackground(
        user.id,
        params.schoolId!,
        classId,
        params.grade!,
      );
      this.chatService.handleSchoolInfoChange(
        updatedUser.profile,
        user.profile?.classId,
      );
    }

    console.log(`Total time: ${Date.now() - startTime}ms`);

    return UserMapper.toDomain(updatedUser);
  }

  private setDefaultTimetableAndCalendarEventsInBackground(
    userId: number,
    schoolId: number,
    classId: number,
    grade: UserGrade,
  ): void {
    setImmediate(async () => {
      try {
        await this.setDefaultTimetableAndCalendarEvents(
          userId,
          schoolId,
          classId,
          grade,
        );
        console.log(`Background task completed for user ${userId}`);
      } catch (error: any) {
        this.handleSetDefaultError(error, { id: userId } as UserEntity);
      }
    });
  }

  private validateRequiredFields(
    schoolId?: number,
    className?: string,
    grade?: UserGrade,
  ): void {
    const hasPartialData = schoolId || className || grade;
    if (hasPartialData && (!schoolId || !className || !grade)) {
      throw new MissingRequiredFieldsError(['schoolId', 'className', 'grade']);
    }
  }

  private async getClassId(
    schoolId?: number,
    className?: string,
    grade?: UserGrade,
  ): Promise<number | undefined> {
    if (schoolId && className && grade) {
      await this.schoolRepository.findByIdOrFail(schoolId);
      const classEntity = await this.classRepository.findByNameAndGradeOrFail(
        schoolId,
        className,
        grade,
      );
      return classEntity.id;
    }
    return undefined;
  }

  private startImageUploads(
    userId: number,
    files: {
      [PROFILE_IMAGE_FIELDS.PROFILE]?: Express.Multer.File[];
      [PROFILE_IMAGE_FIELDS.BACKGROUND]?: Express.Multer.File[];
    },
  ): [Promise<string | undefined>, Promise<string | undefined>] {
    const profileImageFile = files?.[PROFILE_IMAGE_FIELDS.PROFILE]?.[0];
    const backgroundImageFile = files?.[PROFILE_IMAGE_FIELDS.BACKGROUND]?.[0];

    const profileImagePromise = profileImageFile
      ? this.upsertProfileImage(
          userId,
          profileImageFile,
          StorageCategory.USER_PROFILES,
        )
      : Promise.resolve(undefined);

    const backgroundImagePromise = backgroundImageFile
      ? this.upsertProfileImage(
          userId,
          backgroundImageFile,
          StorageCategory.USER_BACKGROUNDS,
        )
      : Promise.resolve(undefined);

    return [profileImagePromise, backgroundImagePromise];
  }

  private async updateUserStatusIfNeeded(userId: number): Promise<void> {
    const user = await this.userRepository.findOneByIdOrFail(userId);
    if (
      user.profile?.classId !== null &&
      user.profile?.classId !== undefined &&
      user.profile?.fullName
    ) {
      await this.userRepository.updateOne({
        id: userId,
        status: UserStatus.ACTIVE,
      });
    }
  }

  private handleSetDefaultError(error: Error, user: UserEntity): void {
    ReportProvider.warn(error, {
      describe: '기본 시간표, 캘린더 이벤트 설정 실패',
      userInfo: user,
    });
  }

  private async setDefaultTimetableAndCalendarEvents(
    userId: number,
    schoolId: number,
    classId: number,
    grade: UserGrade,
  ) {
    await Promise.all([
      this.timetableService.setUserDefaultTimetableWithFallbackFetch(
        userId,
        classId,
      ),
      this.calendarService.setUserSchoolEventsWithFallbackFetch(
        userId,
        schoolId,
        grade,
      ),
    ]);
  }

  async delete(user: UserEntity): Promise<void> {
    try {
      if (user.profile?.profileImageUrl) {
        await this.deleteProfileImage({
          id: user.id,
          profileImageUrl: user.profile!.profileImageUrl!,
        });
      }

      if (user.profile?.backgroundImageUrl) {
        await this.deleteProfileBackgroundImage({
          id: user.id,
          backgroundImageUrl: user.profile!.backgroundImageUrl!,
        });
      }
    } catch (error: any) {
      ReportProvider.warn(error, {
        describe: '탈퇴 회원 이미지 삭제 실패',
        userInfo: user,
      });
    }

    try {
      await this.userRepository.insertLogDeletedUser(user);
    } catch (error: any) {
      ReportProvider.warn(error, { describe: '탈퇴 로그 저장 실패' });
    }

    await this.timetableCacheStorage.removeUserData(user.id);
    await this.userRepository.deleteOne(user.id);
  }

  async deleteProfileImage(
    params: Pick<User, 'id' | 'profileImageUrl'>,
  ): Promise<void> {
    await this.objectStorageService.deleteFile({
      objectUrl: params.profileImageUrl,
    });
    await this.userRepository.updateProfile(params.id, {
      profileImageUrl: null,
    });
  }

  async deleteProfileBackgroundImage(
    params: Pick<User, 'id' | 'backgroundImageUrl'>,
  ): Promise<void> {
    await this.objectStorageService.deleteFile({
      objectUrl: params.backgroundImageUrl,
    });

    await this.userRepository.updateProfile(params.id, {
      backgroundImageUrl: null,
    });
  }

  async updateNotificationSettings(
    userId: number,
    notificationsEnabled: boolean,
  ): Promise<void> {
    await this.userRepository.updateProfile(userId, { notificationsEnabled });
  }
}
