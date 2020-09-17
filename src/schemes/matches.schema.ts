import * as mongoose from 'mongoose';

export const matchesSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        index: true,
    },
    homeTeam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teams',
        required: true,
        index: true,
    },
    awayTeam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teams',
        required: true,
        index: true,
    },
    HTS: {
        type: Number,
        required: true,
        default: 0,
    },
    ATS: {
        type: Number,
        required: true,
        default: 0,
    },
    updated: {
        type: Date,
        default: Date.now(),
    },
});
