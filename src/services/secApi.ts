import dotenv from "dotenv";
import fs from "fs";

dotenv.config({ quiet: true });

if (!process.env.COMPANY || !process.env.EMAIL) {
  throw new Error("Ensure the '.env' in the project has been populated");
}

const HEADERS = new Headers({
  "User-Agent": `${process.env.COMPANY} ${process.env.EMAIL}`,
});

const TICKER_REF = "tickerRef.json";

type TickerEntry = {
  cik_str: number;
  ticker: string;
  title: string;
};

type TickerRef = Record<string, TickerEntry>;

type FilingData = {
  accessionNumber: string;
  filingDate: string;
  reportDate: string;
  form: string;
  primaryDocument: string;
  isXBRL: boolean;
};

type RecentFilings = {
  accessionNumber: string[];
  filingDate: string[];
  reportDate: string[];
  form: string[];
  primaryDocument: string[];
  isXBRL: number[];
};

type SubmissionResponse = {
  filings: {
    recent: RecentFilings;
  };
  cik_str?: number;
  entityType?: string;
  name?: string;
};

type FormType =
  | "10-K"
  | "10-Q"
  | "8-K"
  | "DEF 14A"
  | "3"
  | "4"
  | "SCHEDULE 13G/A";

// Update local ticker reference file store using SEC API
export async function updateTickerRef(): Promise<TickerRef> {
  const response = await fetch(
    "https://www.sec.gov/files/company_tickers.json",
    { headers: HEADERS },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to update ticker references: ${response.statusText}`,
    );
  }

  const raw = await response.json();

  await fs.promises.writeFile(TICKER_REF, JSON.stringify(raw, null, 2));

  const data = JSON.parse(String(raw)) as TickerRef;

  return data;
}

// Read local ticker reference file store into memory
async function readTickerRef(): Promise<TickerRef> {
  const raw = await fs.promises.readFile(TICKER_REF, "utf-8");
  const data = JSON.parse(String(raw)) as TickerRef;

  return data;
}

// Retrieve cik when passing in ticker
async function cikByTicker(ticker: string): Promise<string> {
  const data = await readTickerRef();

  const entry = Object.values(data).find(
    (item) => item.ticker.toUpperCase() === ticker.toUpperCase(),
  );

  if (!entry) {
    throw new Error(
      `Ticker symbol not found on SEC website: ${ticker.toUpperCase()}`,
    );
  }

  return String(entry.cik_str);
}

// Retrieve Company's latest filing
export async function latestFiling(ticker: string, formType?: FormType) {
  // Default to searching for 10-K filing if form type not provided
  if (!formType) {
    formType = "10-K";
  }

  const cik = await cikByTicker(ticker);
  const submissionUrl = `https://data.sec.gov/submissions/CIK${cik.padStart(10, "0")}.json`;

  const response = await fetch(submissionUrl, { headers: HEADERS });

  if (!response.ok) {
    throw new Error(`Failed to retreive filing data: ${response.statusText}`);
  }

  const data: SubmissionResponse =
    (await response.json()) as SubmissionResponse;
  const filings = data.filings.recent;

  const formIndex = filings.form.findIndex((form) => form === formType);
  if (formIndex === -1) {
    throw new Error(`No ${formType} filings found for ticker ${ticker}`);
  }

  const filing: FilingData = {
    accessionNumber: filings.accessionNumber[formIndex]!,
    filingDate: filings.filingDate[formIndex]!,
    reportDate: filings.reportDate[formIndex]!,
    form: filings.form[formIndex]!,
    primaryDocument: filings.primaryDocument[formIndex]!,
    isXBRL: filings.isXBRL[formIndex]! === 1, // convert to boolean
  };

  return filing;
}
