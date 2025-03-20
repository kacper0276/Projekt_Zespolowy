import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class CreateTestingUser1741765146765 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const email = 'test1example.com';
    const login = 'testuser1';
    const password = await bcrypt.hash('testpassword', 10);
    const firstName = 'Test1';
    const lastName = 'User1';
    const role = 'user';

    await queryRunner.query(
      `INSERT INTO user (email, login, password, firstName, lastName, role, isActive)
               VALUES ('${email}', '${login}', '${password}', '${firstName}', '${lastName}', '${role}', true)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM user WHERE email = 'test@example.com'`,
    );
  }
}
