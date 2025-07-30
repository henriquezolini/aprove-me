import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthDto } from '../../presentation/dtos/auth/auth.dto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(authDto: AuthDto) {
    if (authDto.login !== 'aprovame' || authDto.password !== 'aprovame') {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = { login: authDto.login };
    const token = this.jwtService.sign(payload, { expiresIn: '30d' });

    return {
      access_token: token,
      expires_in: 2592000,
    };
  }

  async validateUser(login: string): Promise<any> {
    if (login === 'aprovame') {
      return { login: 'aprovame' };
    }
    return null;
  }
}
