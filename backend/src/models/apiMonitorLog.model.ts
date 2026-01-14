import { response } from "express";
import { Schema, model, Types } from "mongoose";

const ApiMonitorLogSchema = new Schema({
    apiConfigId: {
        type: Types.ObjectId,
        ref: 'ApiConfig',
        required: true
    },
    isUp:{
        type: Boolean,
        required: true
    },
    statusCode: {
        type: Number,
    },
    responseTime: {
        type: Number,
        required: true
    },
    error: {
        type: String,
    },
    checkedAt: {
        type: Date,
        default: Date.now
    }
})

export const ApiMonitorLogModel = model('ApiMonitorLog', ApiMonitorLogSchema);
