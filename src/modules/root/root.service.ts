import {
  Inject,
  Injectable,
  HttpService,
} from '@nestjs/common';
import { MyLogger } from '../logger/logger.service';
import { DatasetRecordInterface } from "../../interfaces/dataset.record.interface";
import { ProxyService } from "../proxy/proxy.service";
import { TotalResultsInterface } from "../../interfaces/total.results.interface";

@Injectable()
export class RootService {
  constructor(
      @Inject(MyLogger) private readonly logger: MyLogger,
      private httpService: HttpService,
      @Inject(ProxyService) private readonly proxyService: ProxyService,
  ) {
  }
  getRootPage(): string {
    return 'Hello World!';
  }

  public async updateDataset(): Promise<void> {
    try{
      const data: DatasetRecordInterface[] = await this.getDataset();
      await this.proxyService.updateTeams(data);
      await this.proxyService.updateMatches(data);
    } catch (e) {
       this.logger.error('Unable to update data', e);
       throw e;
    }
  }

  public async getTotalResults(): Promise<TotalResultsInterface[]> {
    try{

      return this.proxyService.getTotalResults();
    } catch (e) {
      this.logger.error('Unable to update data', e);
      throw e;
    }
  }

  private async getDataset(): Promise<DatasetRecordInterface[]> {
    try {
      const dataset = (await this.httpService.get('https://api.jsonbin.io/b/5ebb0cf58284f36af7ba1779/1').toPromise()).data;

      return dataset.map( record => ({
        AwayTeam: record.AwayTeam,
        HomeTeam: record.HomeTeam,
        Date: record.Date,
        ATS: record.FTAG,
        HTS: record.FTHG,
      }) )
    } catch (e) {
       this.logger.error('Unable to get dataset', e);
       throw e;
    }
  }
}
