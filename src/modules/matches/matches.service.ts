import {
    BadRequestException,
    ConflictException,
    Inject,
    Injectable
} from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { MatchInterface } from '../../interfaces/match.interface';
import { MyLogger } from '../logger/logger.service';
import { DbModelNames } from '../../enums/db.model.names';
import { MatchDbInterface } from "../../interfaces/match.db.interface";
import { TeamForMatchInterface } from "../../interfaces/team.for.match.interface";
import { TeamResultsInteface } from "../../interfaces/team.results.inteface";
import * as moment from "moment";


@Injectable()
export class MatchesService {
    constructor(
        @Inject(MyLogger) private readonly logger: MyLogger,
        @InjectModel(DbModelNames.MATCHES)
        public readonly matchesModel: Model<MatchInterface>
    ) {
    }
    public async updateFromDatasetOneRecord(data: { date: Date, homeTeam: string, awayTeam: string, HTS: number, ATS: number }): Promise<void>{
        try{
            await this.matchesModel.updateOne(
                {
                    date: data.date,
                    homeTeam: data.homeTeam,
                    awayTeam: data.awayTeam,
                },
                {
                    date: data.date,
                    homeTeam: data.homeTeam,
                    awayTeam: data.awayTeam,
                    HTS: data.HTS,
                    ATS: data.ATS,
                },
                {
                    upsert: true,
                }
            )
        } catch (e) {
            this.logger.error('Unable to update match', e);
            throw e;
        }

    }

    public async findMatchResultsApi(conditionArray?: any[]): Promise<MatchDbInterface[]>{
        try {
            if (conditionArray) {
                return await this.matchesModel.find({$or: conditionArray}).populate('awayTeam', 'name').populate('homeTeam', 'name').exec();
            } else {
                return await this.matchesModel.find().populate('awayTeam', 'name').populate('homeTeam', 'name').exec();
            }
        } catch (e) {
            this.logger.error('Unable to retrieve match results', e);
            throw e;
        }
    }

    public async getTeamResults(team: TeamForMatchInterface|null): Promise<TeamResultsInteface>{
        try {
            if (team) {
                return await this.matchesModel.aggregate([
                    {
                        $match: {
                            $or: [
                                {
                                    homeTeam: team._id,
                                },
                                {
                                    awayTeam: team._id,
                                }
                            ]
                        }
                    },
                    {
                        $group: {
                            _id: {
                                $cond: [{
                                    $eq: ["$homeTeam", team._id]
                                }, "home", "away"]
                            },
                            date:{ $addToSet: "$date"},
                            count: {$sum: 1},

                            result: {
                                $push: {
                                    $cond:{
                                        if: {$eq: ["$_id", 'home'] },
                                        then: {
                                            $cond: {
                                                if: {$gt: ["$HTS", "$ATS"]},
                                                then: 'win',
                                                else: {
                                                    $cond: {
                                                        if: {$lt: ["$HTS", "$ATS"]},
                                                        then: 'lose',
                                                        else: 'tie'
                                                    }
                                                },
                                            }
                                        },
                                        else: {
                                            $cond: {
                                                if: {$gt: ["$ATS", "$HTS"]},
                                                then: 'win',
                                                else: {
                                                    $cond: {
                                                        if: {$lt: ["$ATS", "$HTS"]},
                                                        then: 'lose',
                                                        else: 'tie'
                                                    }
                                                },
                                            },
                                        }
                                    }

                                }
                            },
                            score: {
                                $addToSet: {
                                    goals: {
                                        $sum: {
                                            $cond: {
                                                if: {$eq: ["$_id", 'home']},
                                                then: {$sum: '$HTS'},
                                                else: {$sum: '$ATS'}
                                            }
                                        }
                                    },
                                    missedGoals: {
                                        $sum: {
                                            $cond: {
                                                if: {$eq: ["$_id", 'home']},
                                                then: {$sum:'$ATS'},
                                                else: {$sum: '$HTS'}
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            matchesTotal: {$sum: 1},
                            date: 1,
                            result: 1,
                            score: {
                                goals: {
                                    $sum:"$score.goals"
                                },
                                missedGoals:{
                                    $sum:"$score.missedGoals"
                                }
                            },
                        }
                    },
                    {$unwind: '$result'},
                    { "$group": {
                            "_id": null,
                            "total": {$sum: "$matchesTotal"},
                            "wins": {
                                $sum: {
                                    "$cond": [{
                                        $eq: ["$result", "win"]
                                    }, 1, 0]
                                }
                            },
                            "lose": {
                                $sum: {
                                    "$cond": [{
                                        $eq: ["$result", "lose"]
                                    }, 1, 0]
                                }
                            },
                            "tie": {
                                $sum: {
                                    "$cond": [{
                                        $eq: ["$result", "tie"]
                                    }, 1, 0]
                                }
                            },
                            score:{
                                $addToSet: {
                                    goals: {
                                        $sum: {$sum: "$score.goals"}
                                    },
                                    missedGoals: {
                                        $sum: {$sum: "$score.missedGoals"}
                                    }
                                }
                            }
                        },
                    },
                    {
                        $project: {
                            total: 1,
                            wins: 1,
                            lose: 1,
                            tie:1,
                            score: {
                                goals: {
                                    $sum:"$score.goals"
                                },
                                missedGoals:{
                                    $sum:"$score.missedGoals"
                                }
                            },
                        }
                    },
                    {
                        $project: {
                            _id:0,
                            total: 1,
                            wins: 1,
                            lose: 1,
                            tie: 1,
                            score: { $setUnion: [ '$score', [] ] }

                        }
                    },
                    {$unwind: '$score'},
                ]);
            } else {
                throw new BadRequestException('No team specified');
            }
        } catch (e){
            this.logger.error('Unable to retrieve team result', e);
            throw e;
        }
    }

    public async getTeamRatio(team: TeamForMatchInterface|null): Promise<any>{
        try {
            if (team) {
                return await this.matchesModel.aggregate([
                    {
                        $match: {
                            $or: [
                                {
                                    homeTeam: team._id,
                                },
                                {
                                    awayTeam: team._id,
                                }
                            ]
                        }
                    },
                    {
                        $group: {
                            _id: {
                                $cond: [{
                                    $eq: ["$homeTeam", team._id]
                                }, "home", "away"]
                            },
                            date:{ $addToSet: "$date"},

                            result: {
                                $push: {
                                    $cond:{
                                        if: {$eq: ["$_id", 'home'] },
                                        then: {
                                            $cond: {
                                                if: {$gt: ["$HTS", "$ATS"]},
                                                then: 'win',
                                                else: {
                                                    $cond: {
                                                        if: {$lt: ["$HTS", "$ATS"]},
                                                        then: 'lose',
                                                        else: 'tie'
                                                    }
                                                },
                                            }
                                        },
                                        else: {
                                            $cond: {
                                                if: {$gt: ["$ATS", "$HTS"]},
                                                then: 'win',
                                                else: {
                                                    $cond: {
                                                        if: {$lt: ["$ATS", "$HTS"]},
                                                        then: 'lose',
                                                        else: 'tie'
                                                    }
                                                },
                                            },
                                        }
                                    }

                                }
                            },
                        }
                    },
                    {
                        $project: {
                            matchesTotal: {$sum: 1},
                            date: 1,
                            result: 1,
                        }
                    },
                    {$unwind: '$result'},
                    { "$group": {
                            "_id": null,
                            "total": {$sum: "$matchesTotal"},
                            "wins": {
                                $sum: {
                                    "$cond": [{
                                        $eq: ["$result", "win"]
                                    }, 1, 0]
                                }
                            },
                            "lose": {
                                $sum: {
                                    "$cond": [{
                                        $eq: ["$result", "lose"]
                                    }, 1, 0]
                                }
                            },
                            "tie": {
                                $sum: {
                                    "$cond": [{
                                        $eq: ["$result", "tie"]
                                    }, 1, 0]
                                }
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            ratio: { $divide: ['$wins', '$lose'] }
                        }
                    },
                ]);
            } else {
                throw new BadRequestException('No team specified');
            }
        } catch (e){
            this.logger.error('Unable to retrieve team result', e);
            throw e;
        }
    }

    public async deleteAllTeamMatches(team: TeamForMatchInterface): Promise<void>{
        try {
            if (team) {
                await this.matchesModel.deleteMany(
                    {
                        $or: [
                            {
                                homeTeam: team._id,
                            },
                            {
                                awayTeam: team._id,
                            }
                        ]
                    },
                );
            } else {
                throw new BadRequestException('No team specified');
            }
        } catch (e){
            this.logger.error('Unable to retrieve team result', e);
            throw e;
        }
    }

    public async createMatch(match: MatchDbInterface): Promise<MatchDbInterface> {
        try {
            const matchExist: MatchDbInterface[] | null = await this.matchesModel.find(
                {
                    $or: [
                        {
                            date: match.date,
                            homeTeam: match.homeTeam,
                            awayTeam: match.awayTeam,
                        },
                        {
                            date: match.date,
                            homeTeam: match.awayTeam,
                            awayTeam: match.homeTeam,
                        }
                    ]
                }
            );
            if (matchExist.length) {
                throw new ConflictException(
                    `Only one match for ${moment(match.date).format("DD-MM-YYYY")} date between ${match.homeTeam.name} and ${match.awayTeam.name} allowed`
                );
            }
            return await this.matchesModel.create(match);
        } catch (e) {
            this.logger.error('Unable create match', e);
            throw e;
        }
    }

    public async updateMatch(match: MatchDbInterface): Promise<MatchInterface> {
        try{
            let fieldsForUpdate: any = {};
            if (match.date){
                fieldsForUpdate['date'] = match.date;
                const exitingMatchInDate: MatchDbInterface[] = await this.matchesModel.find(
                    {
                        homeTeam: match.homeTeam._id,
                        awayTeam: match.awayTeam._id,
                        date: match.date,
                    })
                if (exitingMatchInDate.length) {
                    throw new ConflictException(
                        `Only one match for ${moment(match.date).format("DD-MM-YYYY")} date between ${match.homeTeam.name} and ${match.awayTeam.name} allowed`
                    )
                }
            }
            if (match.HTS) {
                fieldsForUpdate['HTS'] = match.HTS;
            }
            if (match.ATS) {
                fieldsForUpdate['ATS'] = match.ATS;
            }
            const updatedMatch = await this.matchesModel.findOneAndUpdate(
                {
                    homeTeam: match.homeTeam._id,
                    awayTeam: match.awayTeam._id
                },
                {
                    $set: fieldsForUpdate,
                },
                {
                    new: true
                }
            ).populate('awayTeam', 'name').populate('homeTeam', 'name').exec();
            if (updatedMatch){
                return updatedMatch;
            } else {
                throw new BadRequestException(
                    `Unable to update match`
                );
            }
        } catch (e) {
            this.logger.error('Unable update match', e);
            throw e;
        }
    }
    public async deleteMatch(match: any): Promise<void>{
        try{
            await this.matchesModel.deleteOne({
                awayTeam: match.awayTeam,
                homeTeam: match.homeTeam,
                date: match.date,
            });
        } catch (e) {
            this.logger.error('Unable delete match', e);
            throw e;
        }
    }

}
