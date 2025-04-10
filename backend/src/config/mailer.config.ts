import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import * as dotenv from 'dotenv';

dotenv.config();

export const mailerConfig: any = {
  transport: {
    host: 'smtp.poczta.onet.pl',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_LOGIN,
      pass: process.env.EMAIL_PASSWORD,
      method: 'LOGIN',
    },
  },
  defaults: {
    from: '"Adminisjtracja serwisu" <mailtestowy1221@op.pl>',
  },
  template: {
    dir: process.cwd() + '/template/',
    adapter: new HandlebarsAdapter(),
    options: {
      strict: true,
    },
  },
};
