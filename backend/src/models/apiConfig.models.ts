import { Schema, model } from 'mongoose';

const ApiConfigSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'DELETE'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    headers: {
      type: Map,
      of: String,
      default: {}
    },
    queryParams: {
      type: Map,
      of: String,
      default: {}
    },
    body: {
      type: Schema.Types.Mixed
    },
    timeOutMs: {
      type: Number,
      default: 10000
    }
  },
  {
    timestamps: true
  }
);

export const ApiConfigModel = model('ApiConfig', ApiConfigSchema);
