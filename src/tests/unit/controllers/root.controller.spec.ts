import { Test, TestingModule } from '@nestjs/testing';
import { RootController } from '../../../modules/root/root.controller';
import { RootService } from '../../../modules/root/root.service';

describe('AppController', () => {
  let appController: RootController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [RootController],
      providers: [RootService],
    }).compile();

    appController = app.get<RootController>(RootController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getRootPage()).toBe('Hello 42stairs!');
    });
  });
});
