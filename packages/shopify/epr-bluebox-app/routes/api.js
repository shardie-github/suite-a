import express from "express";
import { requireSessionToken } from "../mw/sessionToken.js";
import { getReport } from "../controllers/reports.js";
export const api = express.Router();
api.get("/reports", requireSessionToken, getReport);
export default api;
