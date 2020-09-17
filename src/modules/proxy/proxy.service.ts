import {
    Inject,
    Injectable,
    BadRequestException,
} from '@nestjs/common';
import { TeamsService } from '../teams/teams.service';
import { MyLogger } from '../logger/logger.service';
import { MatchesService } from "../matches/matches.service";
import { DatasetRecordInterface } from "../../interfaces/dataset.record.interface";
import { TeamForMatchInterface } from "../../interfaces/team.for.match.interface";
import * as moment from "moment";
import { MatchDbInterface } from "../../interfaces/match.db.interface";
import { TeamResultsInteface } from "../../interfaces/team.results.inteface";
import { TotalResultsInterface } from "../../interfaces/total.results.interface";
import { CreateMatchDto } from "../matches/dtos/create.match.dto";
import { UpdateMatchDto } from "../matches/dtos/update.match.dto";
import { MatchInterface } from "../../interfaces/match.interface";
import { DeleteMatchDto } from "../matches/dtos/delete.match.dto";
import { TeamCreatedInterface } from "../../interfaces/team.created.interface";
import { TeamsQueryDto } from "../teams/dtos/teams.query.dto";
import { TeamResultsQueryDto } from "../teams/dtos/team.results.query.dto";
import { TeamRatioQueryDto } from "../teams/dtos/team.ratio.query.dto";
import {MatchResultsQueryDto} from "../matches/dtos/match.results.query.dto";

@Injectable()
export class ProxyService {
    constructor(
        @Inject(TeamsService) private readonly teamsService: TeamsService,
        @Inject(MatchesService) private readonly matchesService: MatchesService,
        @Inject(MyLogger) private readonly logger: MyLogger
    ) {
    }

    public async updateTeams(dataset: DatasetRecordInterface[]): Promise<void> {
        try {
            await this.teamsService.updateTeams(dataset);
        } catch (e) {
            this.logger.error('Unable to update teams from dataset', e);
            throw e;
        }
    }

    public async updateMatches(dataset: DatasetRecordInterface[]): Promise<void> {
        try {
            const teams = await this.teamsService.getAllTeams();
            for (let record of dataset) {
                const homeTeam = teams.find(team => team.name === record.HomeTeam);
                const awayTeam = teams.find(team => team.name === record.AwayTeam);
                if (homeTeam && awayTeam) {
                    const data = {
                        date: moment(record.Date, "DD/MM/YYYY").toDate(),
                        homeTeam: homeTeam._id,
                        awayTeam: awayTeam._id,
                        HTS: record.HTS,
                        ATS: record.ATS,

                    };
                    await this.matchesService.updateFromDatasetOneRecord(data);
                } else {
                    throw new BadRequestException('Failed to seeks up existing team');
                }
            }
        } catch (e) {
            this.logger.error('Unable to insert matches', e);
            throw e;
        }
    }

    public async getAllTeams(): Promise<TeamForMatchInterface[]> {
        try {
            return await this.teamsService.getAllTeams();
        } catch (e) {
            this.logger.error('Unable to get teams', e);
            throw e;
        }
    }

    public async getResultsForTeam(query: TeamResultsQueryDto): Promise<TeamResultsInteface> {
        try {
            const team: TeamForMatchInterface = await this.teamsService.findTeamByName(query.team);

            return await this.matchesService.getTeamResults(team);
        } catch (e) {
            this.logger.error('Unable to retrieve team result', e);
            throw e;
        }
    }

    public async getRatioForTeam(query: TeamRatioQueryDto): Promise<any> {
        try {
            const team: TeamForMatchInterface = await this.teamsService.findTeamByName(query.team);

            return await this.matchesService.getTeamRatio(team);
        } catch (e) {
            this.logger.error('Unable to retrieve team result', e);
            throw e;
        }
    }

    public async getMatchResultsAPI(query: MatchResultsQueryDto): Promise<MatchDbInterface[]> {
        try {
            if (query && Object.keys(query).length) {
                const conditionArray: any[] = await ProxyService.buildQueryConditionForMatch(query, await this.resolveQueryValuesForMatch(query));
                return await this.matchesService.findMatchResultsApi(conditionArray);
            } else {
                return await this.matchesService.findMatchResultsApi();
            }
        } catch (e) {
            this.logger.error('Unable to retrieve teams', e);
            throw e;
        }
    }

    public async getTotalResults(): Promise<TotalResultsInterface[]> {
        try {
            let results = [];
            const teams: TeamForMatchInterface[] = await this.getAllTeams();
            teams.map((record) => {
                results.push({name: record.name, score: 0});
            })
            const matches: MatchDbInterface[] = await this.matchesService.findMatchResultsApi();
            matches.map((record) => {
                let homeTeam = results.find(element => element.name === record.homeTeam.name);
                let awayTeam = results.find(element => element.name === record.awayTeam.name);
                if (record.HTS > record.ATS) {
                    homeTeam.score = homeTeam.score + 3;
                } else if (record.HTS === record.ATS) {
                    homeTeam.score = homeTeam.score + 1;
                    awayTeam.score = awayTeam.score + 1;
                } else {
                    awayTeam.score = awayTeam.score + 3;
                }

            })
            results.sort((a, b) => (a.score < b.score) ? 1 : -1)

            return results
        } catch (e) {
            this.logger.error('Unable to retrieve total results', e);
            throw e;
        }
    }

    public async deleteTeam(team: { name: string }): Promise<void> {
        try {
            const existingTeam: TeamForMatchInterface = await this.teamsService.findTeamByName(team.name);
            if (existingTeam) {
                await this.matchesService.deleteAllTeamMatches(existingTeam);
                await this.teamsService.deleteById(existingTeam._id);
            } else {
                throw new BadRequestException(
                    `Team ${team.name} is not exist`
                );
            }
        } catch (e) {
            this.logger.error(`Unable to delete ${team.name}`, e);
            throw e;
        }
    }

    public async createMatch(match: CreateMatchDto): Promise<MatchDbInterface> {
        try {
            const homeTeam = await this.teamsService.findTeamByName(match.homeTeam);
            const awayTeam = await this.teamsService.findTeamByName(match.awayTeam);
            const date = moment(match.date, "DD/MM/YYYY").toDate();
            const data: MatchDbInterface = {
                homeTeam: homeTeam,
                awayTeam: awayTeam,
                date: date,
                ATS: match.ATS,
                HTS: match.HTS,
            }
            if (homeTeam && awayTeam && date) {
                return await this.matchesService.createMatch(data);
            } else {
                if (homeTeam) {
                    throw new BadRequestException(
                        `${match.awayTeam} team is not exist`
                    );
                } else {
                    throw new BadRequestException(
                        `${match.homeTeam} team is not exist`
                    );
                }
            }
        } catch (e) {
            this.logger.error(`Unable to create match`, e);
            throw e;
        }
    }

    public async updateMatch(match: UpdateMatchDto): Promise<MatchInterface> {
        try {
            const homeTeam: TeamForMatchInterface = await this.teamsService.findTeamByName(match.homeTeam);
            const awayTeam: TeamForMatchInterface = await this.teamsService.findTeamByName(match.awayTeam);
            const date: Date | undefined = match.date ? moment(match.date, "DD-MM-YYYY").toDate() : undefined;
            const data: MatchDbInterface = {
                homeTeam: homeTeam,
                awayTeam: awayTeam,
                date: date,
                ATS: match.ATS,
                HTS: match.HTS,
            }
            if (homeTeam && awayTeam) {
                return await this.matchesService.updateMatch(data);
            } else {
                if (homeTeam) {
                    throw new BadRequestException(
                        `${match.awayTeam} team is not exist`
                    );
                } else {
                    throw new BadRequestException(
                        `${match.homeTeam} team is not exist`
                    );
                }
            }
        } catch (e) {
            this.logger.error(`Unable to update match`, e);
            throw e;
        }
    }

    public async deleteMatch(match: DeleteMatchDto): Promise<void> {
        try {
            const homeTeam = await this.teamsService.findTeamByName(match.homeTeam);
            const awayTeam = await this.teamsService.findTeamByName(match.awayTeam);
            const date = moment(match.date, "DD/MM/YYYY").toDate();
            const data: any = {
                homeTeam: homeTeam._id,
                awayTeam: awayTeam._id,
                date: date,
            }
            await this.matchesService.deleteMatch(data);
        } catch (e) {
            this.logger.error(`Unable to delete match`, e);
            throw e;
        }
    }

    public async findTeams(query?: TeamsQueryDto): Promise<TeamForMatchInterface[]> {
        try {
            return query ? await this.teamsService.findTeamsAPI(query) : await this.teamsService.findTeamsAPI();
        } catch (e) {
            this.logger.error('Unable to retrieve teams', e);
            throw e;
        }
    }

    public async createTeam(team: { name: string }): Promise<TeamCreatedInterface> {
        try {
            return await this.teamsService.createTeam(team);
        } catch (e) {
            this.logger.error(`Unable to create team`, e);
            throw e;
        }
    }

    public async updateTeam(team: { oldName: string, newName: string }): Promise<TeamCreatedInterface> {
        try {
            return await this.teamsService.updateTeam(team);
        } catch (e) {
            this.logger.error(`Unable to update team`, e);
            throw e;
        }
    }

    private async resolveQueryValuesForMatch(query: any): Promise<[TeamForMatchInterface|null, TeamForMatchInterface|null, Date|null]> {
        let teamOne: TeamForMatchInterface | null, teamTwo: TeamForMatchInterface | null, date: Date | null;
        if (query.teamOne) {
            teamOne = await this.teamsService.findTeamByName(query.teamOne);
        }
        if (query.teamTwo) {
            teamTwo = await this.teamsService.findTeamByName(query.teamTwo);
        }
        if (query.date) {
            date = moment(query.date, "DD-MM-YYYY").toDate();
        }
        return [teamOne, teamTwo, date]
    }

    private static async buildQueryConditionForMatch(query: any, values: [TeamForMatchInterface|null, TeamForMatchInterface|null, Date|null]): Promise<any[]> {
        let conditionArray: any[];
        const [teamOne, teamTwo, date] = values;
        if (query.teamOne && query.teamTwo && query.date) {
            if (teamOne && teamTwo) {
                conditionArray = [
                    {
                        date: date,
                        homeTeam: teamOne._id,
                        awayTeam: teamTwo._id,
                    },
                    {
                        date: date,
                        homeTeam: teamTwo._id,
                        awayTeam: teamOne._id,
                    }];
            } else {
                return [];
            }
        } else if (query.teamOne && query.teamTwo) {
            if (teamOne && teamTwo) {
                conditionArray = [
                    {
                        homeTeam: teamOne._id,
                        awayTeam: teamTwo._id,
                    },
                    {
                        homeTeam: teamTwo._id,
                        awayTeam: teamOne._id,
                    }];
            } else {
                return [];
            }
        } else if (query.teamOne && query.date) {
            if (teamOne) {
                conditionArray = [
                    {
                        date: date,
                        homeTeam: teamOne._id,
                    },
                    {
                        date: date,
                        awayTeam: teamOne._id,
                    }];
            } else {
                return [];
            }
        } else if (query.teamOne) {
            if (teamOne) {
                conditionArray = [
                    {
                        homeTeam: teamOne._id,
                    },
                    {
                        awayTeam: teamOne._id,
                    }];
            } else {
                return [];
            }
        } else if (query.teamTwo && query.date) {
            if (teamTwo) {
                conditionArray = [
                    {
                        date: date,
                        awayTeam: teamTwo._id,
                    },
                    {
                        date: date,
                        homeTeam: teamTwo._id,
                    }];
            } else {
                return [];
            }
        } else if (query.teamTwo) {
            if (teamTwo) {
                conditionArray = [
                    {
                        awayTeam: teamTwo._id,
                    },
                    {
                        homeTeam: teamTwo._id,
                    }];
            } else {
                return [];
            }
        } else if (query.date) {
            conditionArray = [
                {
                    date: date,
                }];
        } else {
            return [];
        }
        return conditionArray;
    }

}
