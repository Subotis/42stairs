import {
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Query,
    Body,
    UseInterceptors,
    Delete,
    Patch
} from '@nestjs/common';
import { MainAppInterceptor } from "../../interceptors/main.app.interceptor";
import { TeamForMatchInterface } from "../../interfaces/team.for.match.interface";
import { TeamsTransformInterceptor } from "../../interceptors/teams.transform.interceptor";
import { ProxyService } from "../proxy/proxy.service";
import { TeamResultsInteface } from "../../interfaces/team.results.inteface";
import { CreateTeamDto } from "./dtos/create.team.dto";
import { TeamCreatedInterface } from "../../interfaces/team.created.interface";
import { UpdateTeamDto } from "./dtos/update.team.dto";
import { DeleteTeamDto } from "./dtos/delete.team.dto";
import { TeamTransformInterceptor } from "../../interceptors/team.transform.interceptor";
import { TeamsQueryDto } from "./dtos/teams.query.dto";
import { TeamResultsQueryDto } from "./dtos/team.results.query.dto";
import { TeamRatioQueryDto } from "./dtos/team.ratio.query.dto";

@Controller('teams')
@UseInterceptors(MainAppInterceptor)
export class TeamsController {
    constructor(
        private readonly proxyService: ProxyService
    ) {}

    @Get()
    @UseInterceptors(TeamsTransformInterceptor)
    public async getTeams(
        @Query() query: TeamsQueryDto
    ): Promise<TeamForMatchInterface[]> {

        return this.proxyService.findTeams(query);
    }
    @Get('results')
    public async getResults(
        @Query() query: TeamResultsQueryDto
    ): Promise<TeamResultsInteface> {

        return this.proxyService.getResultsForTeam(query);
    }
    @Get('ratio')
    public async getRatio(
        @Query() query: TeamRatioQueryDto
    ): Promise<TeamForMatchInterface> {

        return this.proxyService.getRatioForTeam(query);
    }

    @Post('/create')
    @UseInterceptors(TeamTransformInterceptor)
    @HttpCode(HttpStatus.CREATED)
    public async createTeam(
        @Body() body: CreateTeamDto,
    ): Promise<TeamCreatedInterface> {

        return this.proxyService.createTeam(body);
    }

    @Patch('/update')
    @UseInterceptors(TeamTransformInterceptor)
    @HttpCode(HttpStatus.OK)
    public async updateTeam(
        @Body() body: UpdateTeamDto,
    ): Promise<TeamCreatedInterface> {

        return this.proxyService.updateTeam(body);
    }

    @Delete('/delete')
    @HttpCode(HttpStatus.OK)
    public async deleteTeam(
        @Body() body: DeleteTeamDto,
    ): Promise<void> {

        return this.proxyService.deleteTeam(body);
    }
}
