import fs from "fs";
import {type TickerRef, type FormType, type FilingData, type SubmissionResponse} from "../types/index.js"

const HEADERS = new Headers({
  "User-Agent": `${process.env.COMPANY} ${process.env.EMAIL}`,
});

const TICKER_REF = "tickerRef.json";



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

  const data = (await response.json()) as TickerRef;

  await fs.promises.writeFile(TICKER_REF, JSON.stringify(data, null, 2));

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
  // Check if TICKER_REF file exists, and generate it if not
  const tickerRefExists = await fs.promises
    .access(TICKER_REF)
    .then(() => true)
    .catch(() => false);

  const data = tickerRefExists
    ? await readTickerRef()
    : await updateTickerRef();

  const entry = Object.values(data).find(
    (item) => item.ticker.toUpperCase() === ticker.toUpperCase(),
  );

  if (!entry) {
    throw new Error(
      `Ticker symbol not found on SEC website: ${ticker.toUpperCase()}`,
    );
  }

  return String(entry.cik_str).padStart(10, "0");
}

// Retrieve Company's latest filing
export async function latestFiling(
  ticker: string,
  formType?: FormType,
): Promise<FilingData> {
  // Default to most recent filing if formType not provided

  const cik = await cikByTicker(ticker);
  const submissionUrl = `https://data.sec.gov/submissions/CIK${cik}.json`;

  const response = await fetch(submissionUrl, { headers: HEADERS });

  if (!response.ok) {
    throw new Error(`Failed to retreive filing data: ${response.statusText}`);
  }

  const data: SubmissionResponse =
    (await response.json()) as SubmissionResponse;
  const filings = data.filings.recent;

  const formIndex = formType
    ? filings.form.findIndex((form) => form === formType)
    : 0;
  if (formIndex === -1) {
    throw new Error(`No ${formType} filings found for ticker ${ticker}`);
  }

  // Forms like 3, 4, and 5 don't support the inline XBRL viewer
  const useInlineViewer =
    filings.isXBRL[formIndex]! === 1 &&
    !["3", "4", "5"].includes(filings.form[formIndex]!);

  const baseUrl = `https://www.sec.gov/Archives/edgar/data/${cik}/${filings.accessionNumber[formIndex]?.replaceAll("-", "")}/${filings.primaryDocument[formIndex]!}`;

  const filingUrl = useInlineViewer
    ? `https://www.sec.gov/ix?doc=/${baseUrl.split(".gov/")[1]}`
    : baseUrl;

  const filing: FilingData = {
    companyName: data.name!,
    accessionNumber: filings.accessionNumber[formIndex]!,
    filingDate: filings.filingDate[formIndex]!,
    reportDate: filings.reportDate[formIndex]!,
    form: filings.form[formIndex]!,
    primaryDocument: filings.primaryDocument[formIndex]!,
    isXBRL: filings.isXBRL[formIndex]! === 1, // convert to boolean
    filingUrl: filingUrl,
  };

  return filing;
}
