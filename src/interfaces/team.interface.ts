import { Document } from 'mongoose'

export interface TeamInterface extends Document {
    name: string,
    updated: Date,
}
