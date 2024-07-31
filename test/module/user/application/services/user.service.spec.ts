import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../../../../../src/module/user/application/services/user.service';
import { User } from '../../../../../src/module/user/domain/entities/user.entity';

class MockUserRepository {
  private users: User[] = [];

  async findById(id: string): Promise<User | undefined> {
    return this.users.find((user) => user.id === id);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.users.find((user) => user.email === email);
  }

  async save(user: User): Promise<void> {
    this.users.push(user);
  }
}

describe('UserService', () => {
  let service: UserService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let repository: MockUserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: 'UserRepository',
          useClass: MockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<MockUserRepository>('UserRepository');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create and find a user', async () => {
    const user = new User('1', 'test@test.com', 'testuser', 'password');
    await service.createUser(user);
    const foundUser = await service.findUserByEmail('test@test.com');
    expect(foundUser).toEqual(user);
  });
});