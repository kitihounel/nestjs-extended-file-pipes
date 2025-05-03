import { join } from 'path';

import { INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from './app/app.module';


describe('Pipes (e2e)', () => {
  let app: INestApplication<App>;
  let testAgent: ReturnType<typeof request>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    testAgent = request(app.getHttpServer());
  });

  it('should group files by field names', (done) => {
    testAgent.post('/uploads/group-files')
      .attach('documents', join(__dirname, './assets/apache-license.pdf'))
      .attach('documents', join(__dirname, './assets/mit-license.pdf'))
      .attach('logo', join(__dirname, './assets/js-logo.png'))
      .attach('mascot', join(__dirname, './assets/node-mascot.png'))
      .expect(201)
      .expect({
        documents: 2,
        logo: 1,
        mascot: 1,
      })
      .end(done);
  });

  it('should accept valid files', (done) => {
    testAgent.post('/uploads/group-files')
      .attach('documents', join(__dirname, './assets/apache-license.pdf'))
      .attach('documents', join(__dirname, './assets/mit-license.pdf'))
      .attach('images', join(__dirname, './assets/js-logo.png'))
      .attach('images', join(__dirname, './assets/node-mascot.png'))
      .expect(201)
      .end(done);
  });

  it('should return 400 by default when validation fails', (done) => {
    testAgent.post('/uploads/validate')
      .attach('documents', join(__dirname, './assets/apache-license.pdf'))
      .attach('documents', join(__dirname, './assets/mit-license.pdf'))
      .attach('documents', join(__dirname, './assets/js-logo.png'))
      .attach('images', join(__dirname, './assets/node-mascot.png'))
      .expect(400)
      .end(done);
  });

  afterAll(async () => {
    await app.close();
  });
});
