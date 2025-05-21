import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Like, Repository } from 'typeorm';
import { RegisterData } from './dto/register-data.dto';
import * as bcrypt from 'bcrypt';
import { LoginData } from './dto/login-data.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateImagesDto } from './dto/update-images.dto';
import { getActivationEmailTemplate } from './templates/activation-email.template';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly mailerService: MailerService,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  private async sendActivationEmail(email: string): Promise<void> {
    const activationLink = `http://localhost:5173/activate-account/${email}`;
    const emailTemplate = getActivationEmailTemplate(activationLink);

    const message = {
      to: email,
      from: `"Administracja serwisu" <mailtestowy1221@op.pl>`,
      subject: 'Potwierdzenie utworzenia konta',
      html: emailTemplate,
    };

    await this.mailerService.sendMail(message);
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

    await this.sendActivationEmail(registerData.email);

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

  async findOneById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateUserStatus(userId: number, isOnline: boolean): Promise<void> {
    await this.userRepository.update({ id: userId }, { isOnline });
  }

  async findOneByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getUsers(
    _page: number,
    _pageSize: number,
    search: string,
  ): Promise<User[]> {
    const [data, _total] = await this.userRepository.findAndCount({
      where: [{ email: Like(`%${search}%`) }, { login: Like(`%${search}%`) }],
    });

    return data;
  }

  async changePassword(data: ChangePasswordDto): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isOldPasswordValid = await bcrypt.compare(
      data.oldPassword,
      user.password,
    );

    if (!isOldPasswordValid) {
      throw new BadRequestException('invalid-old-password');
    }

    if (data.newPassword !== data.confirmNewPassword) {
      throw new BadRequestException('passwords-do-not-match');
    }

    const hashedNewPassword = await this.hashPassword(data.newPassword);
    user.password = hashedNewPassword;
    await this.userRepository.save(user);
  }

  async updateImages(dto: UpdateImagesDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (!user) throw new NotFoundException('User not found');
    if (dto.profileImage) user.profileImage = dto.profileImage;
    if (dto.backgroundImage) user.backgroundImage = dto.backgroundImage;
    await this.userRepository.save(user);
    return user;
  }
}
