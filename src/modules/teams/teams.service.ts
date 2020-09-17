import {
    BadRequestException,
    ConflictException,
    Inject,
    Injectable
} from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { TeamInterface } from '../../interfaces/team.interface';
import { MyLogger } from '../logger/logger.service';
import { DbModelNames } from '../../enums/db.model.names';
import { DatasetRecordInterface } from "../../interfaces/dataset.record.interface";
import { TeamForMatchInterface } from "../../interfaces/team.for.match.interface";
import { TeamCreatedInterface } from "../../interfaces/team.created.interface";

@Injectable()
export class TeamsService {
    constructor(
       @Inject(MyLogger) private readonly logger: MyLogger,
       @InjectModel(DbModelNames.TEAMS)
       public readonly teamsModel: Model<TeamInterface>
    ) {
    }
    public async updateTeams(dataset: DatasetRecordInterface[]): Promise<void> {
        try {
            const existingTeams: TeamInterface[] = await this.teamsModel.find().exec();
            const teams: string[] = [];
            dataset.forEach(record => {
                teams.push(...[record.AwayTeam, record.HomeTeam]);
            })
            const uniqTeams: string[] = Array.from(new Set(teams));
            const teamsToInsert: TeamInterface[] = uniqTeams.filter((item: string) => !existingTeams
                .map(record => record.name)
                .includes(item))
                .map((team:string) => ({
                        name: team,
                        updated: new Date(),
                    })
                );
            await this.teamsModel.insertMany(teamsToInsert);

        } catch (e) {
            this.logger.error('Unable to insert teams', e);
            throw e;
        }
    }

    public async getAllTeams(): Promise<TeamForMatchInterface[]> {
        try {
            return await this.teamsModel.find().exec();
        } catch (e){
            this.logger.error('Unable to get teams', e);
            throw e;
        }
    }

    public async findTeamsAPI(query?: any): Promise<TeamForMatchInterface[]> {
        try{
            if (query && query.filter) {
                return  await this.teamsModel.find(
                    {
                        name: new RegExp(query.filter, 'i')
                    },
                )
            } else {
                return  await this.teamsModel.find().exec()
            }
        } catch (e) {
            this.logger.error('Unable to retrieve teams', e);
            throw e;
        }
    }

    public async findTeamByName(name: string): Promise<TeamForMatchInterface | null> {
        try {
            return await this.teamsModel.findOne({ name:name });
        } catch (e) {
            this.logger.error('Unable to find team', e);
            throw e;
        }
    }

    public async createTeam(team: { name: string }): Promise<TeamCreatedInterface>{
        try{
            const teamExist: TeamForMatchInterface | null = await this.findTeamByName(team.name);
            if (teamExist) {
                throw new ConflictException(
                    `Team ${team.name} already exist`
                );
            }
            return await this.teamsModel.create(
                {
                    name: team.name,
                    updated: new Date(),
                });
        } catch (e) {
            this.logger.error('Unable to retrieve teams', e);
            throw e;
        }
    }

    public async updateTeam(team: { oldName: string, newName: string }): Promise<TeamCreatedInterface>{
        try{
            const existingNewTeam: TeamForMatchInterface = await this.findTeamByName(team.newName);
            const existingOldTeam: TeamForMatchInterface = await this.findTeamByName(team.oldName);
            if (!existingNewTeam && existingOldTeam) {
                return await this.teamsModel.findOneAndUpdate(
                    {
                        name: team.oldName
                    },
                    {
                        name: team.newName,
                        updated: new Date(),
                    },
                    {
                        new: true
                    });
            } else {
                if (existingNewTeam) {
                    throw new ConflictException(
                        `${team.newName} already exist`
                    );
                }
                throw new BadRequestException(
                    `${team.oldName} not exist`
                );
            }
        } catch (e) {
            this.logger.error('Unable to update team', e);
            throw e;
        }
    }
    public async deleteById(id: string): Promise<void>{
        try{
            await this.teamsModel.deleteOne({_id: id});
        } catch (e) {
            throw new BadRequestException(
                `Unable to find team with ${id} ID`
            );
        }
    }

}
