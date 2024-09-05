import { TimetableService } from 'src/module/timetable/application/timetable.service';
import { UserService } from 'src/module/user/application/user.service';
import { Injectable } from '@nestjs/common';

// TODO: 우선은 주먹구구식으로 나이스 홈페이지에서 확인한다(비용 고려)
@Injectable()
export class TimetableSchedulerService {
  constructor(
    private readonly userService: UserService,
    private readonly timetableService: TimetableService,
  ) {}

  //   @Cron('') // TIMETABLE_SETUP_DATES
  async setDefaultTimetables() {
    // 1. 모든 유저 학급 조회
    // const users = await this.userService.findAllUsers();
    // 2. 나이스
    // await this.timetableService.setUserDefaultTimetableWithFallbackFetch(1, 1);
  }
}
