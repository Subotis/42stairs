import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Patch,
    Post,
    Query,
    UseInterceptors
} from '@nestjs/common';
import { MainAppInterceptor } from "../../interceptors/main.app.interceptor";
import { MatchesTransformInterceptor } from "../../interceptors/matches.transform.interceptor";
import { MatchDbInterface } from "../../interfaces/match.db.interface";
import { ProxyService } from "../proxy/proxy.service";
import { CreateMatchDto } from "./dtos/create.match.dto";
import { UpdateMatchDto } from "./dtos/update.match.dto";
import { DeleteMatchDto } from "./dtos/delete.match.dto";
import { MatchInterface } from "../../interfaces/match.interface";
import { MatchTransformInterceptor } from "../../interceptors/match.transform.interceptor";
import { MatchResultsQueryDto } from "./dtos/match.results.query.dto";

@Controller('matches')
@UseInterceptors(MainAppInterceptor)
export class MatchesController {
    constructor(
        private readonly proxyService: ProxyService
    ) {}

    @Get('/results')
    @UseInterceptors(MatchesTransformInterceptor)
    public async getResults(
        @Query() query: MatchResultsQueryDto,
    ): Promise<MatchDbInterface[]> {

        return this.proxyService.getMatchResultsAPI(query);
    }

    @Post('/create')
    @UseInterceptors(MatchTransformInterceptor)
    @HttpCode(HttpStatus.CREATED)
    public async createMatch(
        @Body() body: CreateMatchDto,
    ): Promise<MatchDbInterface> {

        return this.proxyService.createMatch(body);
    }

    @Patch('/update')
    @UseInterceptors(MatchTransformInterceptor)
    @HttpCode(HttpStatus.OK)
    public async updateMatch(
        @Body() body: UpdateMatchDto,
    ): Promise<MatchInterface> {

        return this.proxyService.updateMatch(body);
    }

    @Delete('/delete')
    @HttpCode(HttpStatus.OK)
    public async deleteTeam(
        @Body() body: DeleteMatchDto,
    ): Promise<void> {

        return this.proxyService.deleteMatch(body);
    }

}
