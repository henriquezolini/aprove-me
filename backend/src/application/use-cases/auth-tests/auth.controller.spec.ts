import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../../presentation/controllers/auth.controller';
import { AuthService } from '../../../application/services/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return access token on valid credentials', async () => {
    const authDto = { login: 'aprovame', password: 'aprovame' };
    const result = await controller.login(authDto);

    expect(result).toHaveProperty('access_token');
    expect(result).toHaveProperty('expires_in');
    expect(result.expires_in).toBe(2592000);
  });

  it('should throw UnauthorizedException on invalid credentials', async () => {
    const authDto = { login: 'invalid', password: 'invalid' };

    await expect(controller.login(authDto)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
