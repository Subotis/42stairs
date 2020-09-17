import {
  Controller,
  Get, HttpCode,
  HttpStatus,
  Response,
  UseInterceptors
} from '@nestjs/common';
import { RootService } from './root.service';
import { MainAppInterceptor } from "../../interceptors/main.app.interceptor";
import { TotalResultsInterface } from "../../interfaces/total.results.interface";
import { TotalResultsInterceptor } from "../../interceptors/total.results.interceptor";

@Controller()
@UseInterceptors(MainAppInterceptor)
export class RootController {
  constructor(
      private readonly rootService: RootService
  ) {}

  @Get()
  getRootPage(): string {

    return this.rootService.getRootPage();
  }
  @Get('/update-dataset')
  @HttpCode(HttpStatus.OK)
  public async updateDataset() {
      await this.rootService.updateDataset();
  }

  @Get('/total-results')
  @UseInterceptors(TotalResultsInterceptor)
  public async championshipResults(): Promise<TotalResultsInterface[]> {

    return this.rootService.getTotalResults();
  }
}
