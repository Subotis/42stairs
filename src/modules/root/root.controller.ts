import { Controller, Get, HttpStatus, Response, UseInterceptors } from '@nestjs/common';
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
  public async updateDataset(
      @Response() res: any
  ) {
    try{
      await this.rootService.updateDataset();
      res.status(HttpStatus.OK).json('Update performed successfully');
  } catch (e){
      res.status(HttpStatus.BAD_REQUEST).send();
    }
  }

  @Get('/total-results')
  @UseInterceptors(TotalResultsInterceptor)
  public async championshipResults(): Promise<TotalResultsInterface[]> {
      return this.rootService.getTotalResults();
  }
}
