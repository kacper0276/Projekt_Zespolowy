import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterData } from './dto/register-data.dto';
import * as bcrypt from 'bcrypt';
import { LoginData } from './dto/login-data.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  getAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  async registerUser(registerData: RegisterData): Promise<User> {
    if (registerData.password !== registerData.repeatedPassword) {
      throw new BadRequestException('passwords-do-not-match');
    }

    const exisitngUser = await this.userRepository.findOne({
      where: [{ email: registerData.email }, { login: registerData.login }],
    });

    if (exisitngUser) {
      throw new BadRequestException('user-already-exists');
    }

    const hashedPassword = await this.hashPassword(registerData.password);

    const user = new User();
    user.email = registerData.email;
    user.login = registerData.login;
    user.password = hashedPassword;
    user.firstName = registerData.firstName;
    user.lastName = registerData.lastName;
    user.isActive = false;
    user.role = registerData.role;

    return this.userRepository.save(user);
  }

  async loginUser(loginData: LoginData) {
    const user = await this.userRepository.findOne({
      where: { email: loginData.email, isActive: true },
    });

    if (!user) {
      throw new BadRequestException('invalid-user-data');
    }

    const isPasswordValid = await bcrypt.compare(
      loginData.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('invalid-user-data');
    }

    return user;
  }

  async activateAccount(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('user-not-found');
    }

    user.isActive = true;
    return this.userRepository.save(user);
  }
}
