import dotenv from "dotenv";

export function loadEnvVars(): void {
    dotenv.config({ quiet: true });
    
    if (!process.env.COMPANY || !process.env.EMAIL) {
      throw new Error("Ensure the '.env' in the project has been populated");
    }
}