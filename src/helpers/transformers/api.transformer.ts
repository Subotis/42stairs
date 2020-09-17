import { TeamApiInterface } from "../../interfaces/team.api.interface";
import { TeamForMatchInterface } from "../../interfaces/team.for.match.interface";
import { MatchResultsApiInterface } from "../../interfaces/match.results.api.interface";
import * as moment from 'moment';
import { MatchDbInterface } from "../../interfaces/match.db.interface";
import { TotalResultsInterface } from "../../interfaces/total.results.interface";

export const transformTeams = (records: TeamForMatchInterface[]): TeamApiInterface[] => {
    if (records.length){
       return records.map(record => ({
           name: record.name,
       }))
    } else {
       return []
    }
}
export const transformTeam = (record: TeamForMatchInterface): TeamApiInterface | null => {
    if (record) {
        return { name: record.name, updated: moment(record.updated).format("DD-MM-YYYY") }
    } else {
        return null
    }
}

export const transformMatches = (records: MatchDbInterface[]): MatchResultsApiInterface[] => {
    if (records.length){
        return records.map(record => ({
            date: moment(record.date).format("DD-MM-YYYY"),
            homeTeam: record.homeTeam.name,
            awayTeam: record.awayTeam.name,
            score: `${record.HTS} - ${record.ATS}`,
            HTS: record.HTS,
            ATS: record.ATS,
        }))

    } else {
        return []
    }
}
export const transformMatch = (record: MatchDbInterface): MatchResultsApiInterface | null => {
    if (record){
        return {
            date: moment(record.date).format("DD-MM-YYYY"),
            homeTeam: record.homeTeam.name,
            awayTeam: record.awayTeam.name,
            score: `${record.HTS} - ${record.ATS}`,
            HTS: record.HTS,
            ATS: record.ATS,
        }
    } else {
        return null

    }
}

export const transformTotalResult = (records: TotalResultsInterface[]): any => {
    if (records.length){
        let result = {};
        records.map(record => (
            result[record.name] = record.score
        ))
        return result
    } else {
        return null
    }
}
