import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterData } from './dto/register-data.dto';
import * as bcrypt from 'bcrypt';
import { LoginData } from './dto/login-data.dto';
import { MailerService } from '@nestjs-modules/mailer';

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
    const emailTemplate = `
    <!DOCTYPE html>
    <html lang="pl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Potwierdzenie rejestracji</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f9f9f9;
                color: #333;
            }

            .email-container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                transition: transform 0.3s ease;
            }

            .email-container:hover {
                transform: scale(1.02);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            }

            .email-header {
                background: linear-gradient(90deg, #080078, #be0533);
                color: #ffffff;
                text-align: center;
                padding: 20px;
                font-size: 24px;
            }

            .email-body {
                padding: 20px;
            }

            .email-body p {
                margin: 0 0 15px;
                line-height: 1.6;
            }

            .email-body a {
                display: inline-block;
                background: linear-gradient(90deg, #080078, #be0533);
                color: #ffffff;
                text-decoration: none;
                padding: 10px 20px;
                border-radius: 4px;
                font-size: 16px;
                margin-top: 10px;
                transition: background 0.3s ease, transform 0.3s ease;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }

            .email-body a:hover {
                background: linear-gradient(90deg, #080078, #be0533);
                transform: translateY(-3px);
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
            }

            .email-footer {
                background-color: #f1f1f1;
                text-align: center;
                padding: 10px;
                font-size: 12px;
                color: #666;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="email-header">
                Potwierdzenie rejestracji
            </div>
            <div class="email-body">
                <p>Witaj, </p>
                <p>Dziękujemy za rejestrację na naszej platformie. Aby aktywować swoje konto, kliknij poniższy przycisk:</p>
                <p>
                    <a href="${activationLink}" target="_blank">Aktywuj konto</a>
                </p>
                <p>Jeśli nie rejestrowałeś/aś się w naszym serwisie, zignoruj tę wiadomość.</p>
            </div>
            <div class="email-footer">
                &copy; 2025 KanbanBoard. Wszelkie prawa zastrzeżone.
            </div>
        </div>
    </body>
    </html>
    `;

    const message = {
      to: email,
      from: `"Administracja serwisu" <kacper4312@op.pl>`,
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
}
