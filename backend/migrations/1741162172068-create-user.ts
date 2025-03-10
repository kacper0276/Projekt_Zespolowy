import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class CreateTestUser1741162172068 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const email = 'test@example.com';
    const login = 'testuser';
    const password = await bcrypt.hash('testpassword', 10);
    const firstName = 'Test';
    const lastName = 'User';
    const role = 'user';

    await queryRunner.query(
      `INSERT INTO user (email, login, password, firstName, lastName, role, isActive)
       VALUES ('${email}', '${login}', '${password}', '${firstName}', '${lastName}', '${role}', false)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM user WHERE email = 'test@example.com'`,
    );
  }
}
