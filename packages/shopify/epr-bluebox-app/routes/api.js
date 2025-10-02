import express from "express";
import { requireSessionToken } from "../mw/sessionToken.js";
import { requireApiKey } from "../mw/apiKey.js";
import { getReport } from "../controllers/reports.js";
export const api = express.Router();
api.get("/reports", requireSessionToken, getReport);
export default api;

api.get("/reports/public", requireApiKey, getReport);
