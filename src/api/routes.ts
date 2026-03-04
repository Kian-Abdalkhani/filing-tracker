import { type Express } from "express";
import path from "path";
import {fileURLToPath} from "url";
import {latestFiling} from "./../services/secApi.js";
import {type FilingData, type FormType} from '../types/index.js'

export function registerRoutes(app: Express): void {
  app.get("/filing/latest", async (req, res) => {
    try {
      const ticker = req.query.ticker as string;
      const formType = req.query.formType as FormType;

      if (typeof ticker !== "string" || ticker.length === 0) {
        res.status(400).json({ error: "Query paramter 'ticker' is required" });
      }

      const filing: FilingData =
        typeof formType === "string" && formType.length > 0
          ? await latestFiling(
              ticker,
              formType as Parameters<typeof latestFiling>[1],
            )
          : await latestFiling(ticker);

      res.status(200).json(filing);
    } catch (err) {
      console.error(err);

      res.status(500).json({ error: "Failed to retreive filing data." });
    }
  });

  // 
  app.get("/download-tickers", async (req, res) => {

    const __filename = fileURLToPath(import.meta.url);

    const __dirname = path.dirname(__filename);

    const downloadPath = path.join(__dirname, '..', '..', 'tickerRef.json');
    res.download(downloadPath);
  });
}
