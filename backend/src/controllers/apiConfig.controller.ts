import type { Request, Response } from 'express';
import { ApiConfigModel } from '../models/apiConfig.models.ts';

export async function createApiConfig(req: Request, res: Response) {
  const config = await ApiConfigModel.create(req.body);
  res.status(201).json(config);
}

export async function getAllApiConfigs(req: Request, res: Response) {
  const configs = await ApiConfigModel.find().sort({ createdAt: -1 });
  res.json(configs);
}

export async function getApiConfigById(req: Request, res: Response) {
  const config = await ApiConfigModel.findById(req.params.id);

  if (!config) {
    return res.status(404).json({ error: 'API config not found' });
  }

  res.json(config);
}

export async function getConfigsWithStatus(req: Request, res: Response) {
  const data = await ApiConfigModel.aggregate([
    {
      $lookup: {
        from: "apimonitorlogs",
        localField: "_id",
        foreignField: "apiConfigId",
        as: "logs",
      },
    },
    {
      $addFields: {
        latest: { $arrayElemAt: [{ $slice: ["$logs", -1] }, 0] },
      },
    },
    {
      $project: {
        logs: 0,
      },
    },
  ]);

  res.json(data);
}

export async function updateApiConfig(req: any, res: any) {
  const { id } = req.params;
  const updated = await ApiConfigModel.findByIdAndUpdate(id, req.body, { new: true });
  if (!updated) return res.status(404).json({ message: "Config not found" });
  res.json(updated);
}

export async function deleteApiConfig(req: any, res: any) {
  const { id } = req.params;
  const deleted = await ApiConfigModel.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ message: "Config not found" });
  res.json({ message: "Deleted", id });
}