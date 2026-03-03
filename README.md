# filing-tracker

A Node.js CLI/service for tracking SEC EDGAR filings by ticker symbol. Fetches company filing data (10-K, 10-Q, 8-K, etc.) from the SEC API with cron-based scheduling for periodic updates.

## Features

- Retrieve company filings by ticker symbol
- Support for multiple SEC form types (10-K, 10-Q, 8-K, etc.)
- Automated ticker-to-CIK mapping updates via cron scheduler
- REST API for filing data access
- Built with TypeScript (ESM) and strict type checking

## Prerequisites

- Node.js (v18 or higher recommended)
- npm

## Installation

```bash
npm install
```

## Configuration

Copy `.env.example` to `.env` and set the required environment variables:

```bash
COMPANY=YourCompanyName
EMAIL=your.email@example.com
```

**Note:** The SEC API requires a User-Agent header. The `COMPANY` and `EMAIL` values are used to construct this header.

## Usage

### Development

Run the application in watch mode with hot-reload:

```bash
npm run dev
```

### Build

Compile TypeScript to JavaScript:

```bash
npm run build
```

### Production

Run the compiled application:

```bash
npm run start
```

## Project Structure

```
src/
  app.ts              # Application entry point
  api/
    routes.ts         # REST API routes
  scheduler/
    jobs.ts           # Cron job definitions
  services/
    secApi.ts         # SEC EDGAR API client
```

## License

ISC

## Author

Kian Abdalkhani
