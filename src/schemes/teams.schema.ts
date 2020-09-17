import * as mongoose from 'mongoose';

export const teamsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        index: true,
    },
    updated: {
        type: Date,
        default: Date.now(),
    },
});
