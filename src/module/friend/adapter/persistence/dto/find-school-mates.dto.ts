import { FindFriendsDto } from './find-friends.dto';

export type FindSchoolmateDto = Omit<FindFriendsDto, 'isFavorite'>;
