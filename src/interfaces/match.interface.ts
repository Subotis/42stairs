import { Document } from 'mongoose'

export interface MatchInterface extends Document {
    id?: string,
    date: Date,
    homeTeam: string,
    awayTeam: string,
    HTS?: number,
    ATS?: number,
}
