export type TickerEntry = {
  cik_str: number;
  ticker: string;
  title: string;
};

export type TickerRef = Record<string, TickerEntry>;

export type FilingData = {
  companyName: string;
  accessionNumber: string;
  filingDate: string;
  reportDate: string;
  form: string;
  primaryDocument: string;
  isXBRL: boolean;
  filingUrl: string;
};

export type RecentFilings = {
  accessionNumber: string[];
  filingDate: string[];
  reportDate: string[];
  form: string[];
  primaryDocument: string[];
  isXBRL: number[];
};

export type SubmissionResponse = {
  filings: {
    recent: RecentFilings;
  };
  cik_str?: number;
  entityType?: string;
  name?: string;
};

export type FormType =
  | "10-K"
  | "10-Q"
  | "8-K"
  | "DEF 14A"
  | "3"
  | "4"
  | "SCHEDULE 13G/A";