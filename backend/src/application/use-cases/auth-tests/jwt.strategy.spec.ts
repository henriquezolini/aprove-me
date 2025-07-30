import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from '../../../presentation/guards/jwt.strategy';
import { AuthService } from '../../../application/services/auth.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let authService: AuthService;

  beforeEach(async () => {
    const mockAuthService = {
      validateUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should validate user successfully', async () => {
      const payload = { login: 'testuser', sub: '1' };
      const mockUser = { id: '1', login: 'testuser' };

      jest.spyOn(authService, 'validateUser').mockResolvedValue(mockUser);

      const result = await strategy.validate(payload);

      expect(result).toEqual(mockUser);
      expect(authService.validateUser).toHaveBeenCalledWith(payload.login);
      expect(authService.validateUser).toHaveBeenCalledTimes(1);
    });

    it('should return null when user not found', async () => {
      const payload = { login: 'nonexistent', sub: '1' };

      jest.spyOn(authService, 'validateUser').mockResolvedValue(null);

      const result = await strategy.validate(payload);

      expect(result).toBeNull();
      expect(authService.validateUser).toHaveBeenCalledWith(payload.login);
      expect(authService.validateUser).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors', async () => {
      const payload = { login: 'testuser', sub: '1' };
      const error = new Error('Service error');

      jest.spyOn(authService, 'validateUser').mockRejectedValue(error);

      await expect(strategy.validate(payload)).rejects.toThrow('Service error');
      expect(authService.validateUser).toHaveBeenCalledWith(payload.login);
      expect(authService.validateUser).toHaveBeenCalledTimes(1);
    });
  });
});
