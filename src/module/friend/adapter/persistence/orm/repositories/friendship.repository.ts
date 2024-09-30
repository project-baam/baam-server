import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { FriendRepository } from 'src/module/friend/application/port/friend.repository.abstract';
import { FriendshipEntity } from '../entities/friendship.entity';
import { FriendRequestStatus } from 'src/module/friend/domain/enums/friend-request-status.enum';
import { UserProfileEntity } from 'src/module/user/adapter/persistence/orm/entities/user-profile.entity';
import { FriendRequestsEntity } from '../entities/friend-requests.entity';
import {
  GetFavoriteFriendsRequest,
  GetFriendRequestRequest,
  GetFriendsRequest,
  GetSchoolmatesRequest,
} from '../../../presenter/rest/dto/friend.dto';
import { PaginatedList } from 'src/common/dto/response.dto';
import { ContentNotFoundError } from 'src/common/types/error/application-exceptions';
import { FindFriendsDto } from '../dto/find-friends.dto';
import { FindFavoriteFriendsDto } from '../dto/find-favorite-friends.dto';
import { UserGrade } from 'src/module/school-dataset/domain/value-objects/grade';
import { FindSchoolmateDto } from '../dto/find-school-mates.dto';

export class OrmFriendRepository implements FriendRepository {
  constructor(
    @InjectRepository(FriendshipEntity)
    private readonly friendshipRepository: Repository<FriendshipEntity>,

    @InjectRepository(FriendRequestsEntity)
    private readonly friendRequestsRepository: Repository<FriendRequestsEntity>,

    @InjectRepository(UserProfileEntity)
    private readonly userProfileRepository: Repository<UserProfileEntity>,
  ) {}

  async deleteFriendRequest(id: number): Promise<void> {
    await this.friendRequestsRepository.delete(id);
  }

  async findRequestByIdOrFail(id: number): Promise<FriendRequestsEntity> {
    const request = await this.friendRequestsRepository.findOneBy({ id });
    if (!request) {
      throw new ContentNotFoundError('FriendRequest', id);
    }

    return request;
  }

  private sortUserIdsAscending(
    userId1: number,
    userId2: number,
  ): [number, number] {
    return userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];
  }

  async createFriendship(userId1: number, userId2: number): Promise<void> {
    const [user1Id, user2Id] = this.sortUserIdsAscending(userId1, userId2);

    const friendship = this.friendshipRepository.create({
      user1Id,
      user2Id,
    });

    await this.friendshipRepository.save(friendship);
  }

  async toggleFavorite(userId: number, friendId: number): Promise<void> {
    const [user1Id, user2Id] = this.sortUserIdsAscending(userId, friendId);
    const isUser1 = userId === user1Id;

    const friendship = await this.friendshipRepository.findOne({
      where: { user1Id, user2Id },
    });

    if (!friendship) {
      throw new ContentNotFoundError('friendship', `${user1Id}, ${user2Id}`);
    }

    if (isUser1) {
      friendship.isUser1Favorite = !friendship.isUser1Favorite;
    } else {
      friendship.isUser2Favorite = !friendship.isUser2Favorite;
    }

    await this.friendshipRepository.save(friendship);
  }

  async isFriend(userId1: number, userId2: number): Promise<boolean> {
    const [user1Id, user2Id] = this.sortUserIdsAscending(userId1, userId2);

    const friendship = await this.friendshipRepository.findOne({
      where: { user1Id, user2Id },
    });
    return !!friendship;
  }

  async removeFriendShip(userId1: number, userId2: number): Promise<void> {
    const [user1Id, user2Id] = this.sortUserIdsAscending(userId1, userId2);
    await this.friendshipRepository.delete({ user1Id, user2Id });
  }

  async getFavoriteFriends(
    userId: number,
    params: GetFavoriteFriendsRequest,
  ): Promise<PaginatedList<FindFavoriteFriendsDto>> {
    const { count, page } = params;
    const limit = count;
    const offset = count * page;

    const [favoriteFriendships, totalResult] = await Promise.all([
      this.friendshipRepository.query(
        `
      WITH favorite_friends AS (
    SELECT
        CASE
            WHEN f.user1_id = ${userId} THEN f.user2_id
            ELSE f.user1_id
        END AS friend_id
    FROM friendships f
    WHERE ${userId} IN (f.user1_id, f.user2_id)
        AND (
            (f.user1_id = ${userId} AND f.is_user1_favorite = true)
            OR (f.user2_id = ${userId} AND f.is_user2_favorite = true)
        )
)
SELECT
    up.user_id AS "userId",
    up.full_name AS "fullName",
    up.profile_image_url AS "profileImage"
FROM favorite_friends ff
JOIN user_profile up ON ff.friend_id = up.user_id
ORDER BY up.sort_key
LIMIT ${limit} OFFSET ${offset};
    `,
      ),
      this.friendshipRepository.query(
        `
        SELECT COUNT(*) as total
        FROM friendships f
        WHERE $1 IN (f.user1_id, f.user2_id)
          AND (
            (f.user1_id = $1 AND f.is_user1_favorite = true)
            OR (f.user2_id = $1 AND f.is_user2_favorite = true)
          )
        `,
        [userId],
      ),
    ]);

    return {
      list: favoriteFriendships,
      total: parseInt(totalResult[0].total),
    };
  }

  async findFriends(
    userId: number,
    params: GetFriendsRequest,
  ): Promise<
    PaginatedList<FindFriendsDto> & {
      initialCounts: Record<string, number>;
    }
  > {
    const { count, page, name, initials } = params;
    const limit = count;
    const offset = count * page;

    const [list, totalAndInitialCounts] = await Promise.all([
      this.friendshipRepository.query(
        `
     WITH
  friend_data AS (
    SELECT
      CASE
        WHEN f.user1_id = $1 THEN f.user2_id
        ELSE f.user1_id
      END AS friend_id,
      CASE
        WHEN f.user1_id = $1 THEN f.is_user1_favorite
        ELSE f.is_user2_favorite
      END AS is_favorite
    FROM
      friendships f
    WHERE
      $1 IN (f.user1_id, f.user2_id)
  )
SELECT
  up.user_id AS "userId",
  up.full_name AS "fullName",
  up.profile_image_url AS "profileImage",
  c.grade AS "grade",
  c.name AS "className",
  fd.is_favorite AS "isFavorite",
  up.initial
FROM
  friend_data fd
  JOIN user_profile up ON fd.friend_id = up.user_id
  JOIN class c ON up.class_id = c.id
WHERE
  (
    $2::text IS NULL
    OR up.full_name ILIKE '%' || $2 || '%'
  )
  AND (
    $3::text[] IS NULL
    OR up.initial = ANY ($3)
  )
ORDER BY
  up.sort_key
LIMIT
  $4
OFFSET
  $5;   `,
        [userId, name, initials, limit, offset],
      ),

      this.friendshipRepository.query(
        `
 WITH
  friend_data AS (
    SELECT
      CASE
        WHEN f.user1_id = $1 THEN f.user2_id
        ELSE f.user1_id
      END AS friend_id
    FROM
      friendships f
    WHERE
      $1 IN (f.user1_id, f.user2_id)
  ),
  filtered_friends AS (
    SELECT
      fd.friend_id,
      up.initial
    FROM
      friend_data fd
      JOIN user_profile up ON fd.friend_id = up.user_id
    WHERE
      (
        $2::text IS NULL
        OR up.full_name ILIKE '%' || $2 || '%'
      )
      AND (
        $3::text[] IS NULL
        OR up.initial = ANY ($3)
      )
  )
SELECT
  (
    SELECT
      COUNT(*)
    FROM
      filtered_friends
  ) AS total,
  initial,
  COUNT(*) AS "initialCount"
FROM
  filtered_friends
GROUP BY
  initial`,
        [userId, name, initials],
      ),
    ]);

    const total = Number(totalAndInitialCounts[0]?.total);
    const initialCounts = (<
      {
        total: number;
        initial: string;
        initialCount: number;
      }[]
    >totalAndInitialCounts).reduce(
      (acc, { initial, initialCount }) => {
        acc[initial] = Number(initialCount);
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      list,
      total,
      initialCounts,
    };
  }

  async findFriendRequests(
    params: GetFriendRequestRequest,
    where: Partial<
      Pick<FriendRequestsEntity, 'status' | 'receiverId' | 'senderId'>
    >,
  ): Promise<PaginatedList<FriendRequestsEntity>> {
    const { status, receiverId, senderId } = where;

    const query = this.friendRequestsRepository
      .createQueryBuilder('fr')
      .leftJoinAndSelect('fr.sender', 'sender')
      .leftJoinAndSelect('sender.class', 'senderClass')
      .leftJoinAndSelect('fr.receiver', 'receiver')
      .leftJoinAndSelect('receiver.class', 'receiverClass');

    if (status) {
      query.where('fr.status = :status', { status });
    }

    if (receiverId) {
      query.andWhere('fr.receiverId = :receiverId', { receiverId });
    }

    if (senderId) {
      query.andWhere('fr.senderId = :senderId', { senderId });
    }

    query
      .skip(params.page * params.count)
      .take(params.count)
      .orderBy('fr.createdAt', 'DESC');

    const [list, total] = await query.getManyAndCount();

    return {
      list,
      total,
    };
  }

  /**
   * No Pagination
   */
  async findFriendRequestBySenderAndReceiver(
    conditions: Partial<
      Pick<FriendRequestsEntity, 'status' | 'receiverId' | 'senderId'>
    >,
  ): Promise<FriendRequestsEntity[]> {
    const { status, receiverId, senderId } = conditions;

    const where: FindOptionsWhere<FriendRequestsEntity> = {
      senderId,
      receiverId,
    };

    if (status) {
      where.status = status;
    }

    return this.friendRequestsRepository.find({
      where,
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async insertFriendRequest(
    senderId: number,
    receiverId: number,
    status: FriendRequestStatus,
  ): Promise<FriendRequestsEntity> {
    const friendRequest = this.friendRequestsRepository.create({
      senderId,
      receiverId,
      status,
    });

    return this.friendRequestsRepository.save(friendRequest);
  }

  async updateFriendRequestStatus(
    id: number,
    status: FriendRequestStatus,
  ): Promise<void> {
    await this.friendRequestsRepository.update(id, { status });
  }

  async findSchoolmates(
    userId: number,
    schoolId: number,
    params: GetSchoolmatesRequest,
  ): Promise<
    PaginatedList<FindSchoolmateDto> & {
      initialCounts: Record<string, number>;
    }
  > {
    const { count, page, name, initials, grades, isFavorite } = params;
    const limit = count;
    const offset = count * page;

    const [list, totalAndInitialCounts] = await Promise.all([
      this.userProfileRepository.query(
        `
          WITH
            school_mate_data AS (
              SELECT
                up.user_id,
                up.full_name,
                up.profile_image_url,
                c.grade,
                c.name AS class_name,
                up.initial,
                up.sort_key,
                CASE
                  WHEN f.user1_id = $1 THEN f.is_user1_favorite
                  WHEN f.user2_id = $1 THEN f.is_user2_favorite
                  ELSE NULL
                END AS is_favorite
              FROM
                user_profile up
                JOIN class c ON up.class_id = c.id
                LEFT JOIN friendships f ON (f.user1_id = $1 AND f.user2_id = up.user_id) OR (f.user2_id = $1 AND f.user1_id = up.user_id)
              WHERE
                c.school_id = $2
                AND up.user_id != $1
            )
          SELECT
            user_id AS "userId",
            full_name AS "fullName",
            profile_image_url AS "profileImage",
            grade AS "grade",
            class_name AS "className",
            is_favorite AS "isFavorite",
            initial
          FROM
            school_mate_data
          WHERE
            ($3::text IS NULL OR full_name ILIKE '%' || $3 || '%')
            AND ($4::text[] IS NULL OR initial = ANY ($4))
            AND ($5::int[] IS NULL OR grade::text = ANY ($5::text[]))
            AND ($6::boolean IS NULL OR is_favorite = $6)
          ORDER BY
            sort_key
          LIMIT $7
          OFFSET $8;
          `,
        [userId, schoolId, name, initials, grades, isFavorite, limit, offset],
      ),

      this.userProfileRepository.query(
        `
          WITH
            school_mate_data AS (
              SELECT
                up.user_id,
                up.full_name,
                up.initial,
                c.grade,
                CASE
                  WHEN f.user1_id = $1 THEN f.is_user1_favorite
                  WHEN f.user2_id = $1 THEN f.is_user2_favorite
                  ELSE NULL
                END AS is_favorite
              FROM
                user_profile up
                JOIN class c ON up.class_id = c.id
                LEFT JOIN friendships f ON (f.user1_id = $1 AND f.user2_id = up.user_id) OR (f.user2_id = $1 AND f.user1_id = up.user_id)
              WHERE
                c.school_id = $2
                AND up.user_id != $1
            ),
            filtered_school_mates AS (
              SELECT
                user_id,
                initial
              FROM
                school_mate_data
              WHERE
                ($3::text IS NULL OR full_name ILIKE '%' || $3 || '%')
                AND ($4::text[] IS NULL OR initial = ANY ($4))
                AND ($5::int[] IS NULL OR grade::text = ANY ($5::text[]))
                AND ($6::boolean IS NULL OR is_favorite = $6)
            )
          SELECT
            (
              SELECT
                COUNT(*)
              FROM
                filtered_school_mates
            ) AS total,
            initial,
            COUNT(*) AS "initialCount"
          FROM
            filtered_school_mates
          GROUP BY
            initial
          `,
        [userId, schoolId, name, initials, grades, isFavorite],
      ),
    ]);

    const total = Number(totalAndInitialCounts[0]?.total) || 0;
    const initialCounts = (<
      {
        total: number;
        initial: string;
        initialCount: number;
      }[]
    >totalAndInitialCounts).reduce(
      (acc, { initial, initialCount }) => {
        acc[initial] = Number(initialCount);
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      list,
      total,
      initialCounts,
    };
  }
}
