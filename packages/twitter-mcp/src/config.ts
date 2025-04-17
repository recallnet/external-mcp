import chalk from "chalk";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Define types for configuration variables
interface Config {
  TWITTER_USERNAME?: string;
  TWITTER_PASSWORD?: string;
  TWITTER_EMAIL?: string;
  TWITTER_API_KEY?: string;
  TWITTER_API_SECRET_KEY?: string;
  TWITTER_ACCESS_TOKEN?: string;
  TWITTER_ACCESS_TOKEN_SECRET?: string;
  PROXY_URL?: string;
  DEBUG?: boolean;
}

// Custom logger implementation
export const logger = {
  error: (...args: any[]) =>
    process.stderr.write(`${chalk.red("[ERROR]")} ${args.join(" ")}\n`),
  warn: (...args: any[]) =>
    process.stderr.write(`${chalk.yellow("[WARN]")} ${args.join(" ")}\n`),
  info: (...args: any[]) =>
    process.stderr.write(`${chalk.blue("[INFO]")} ${args.join(" ")}\n`),
};

// Export configuration object
export const config: Config = {
  TWITTER_USERNAME: process.env.TWITTER_USERNAME,
  TWITTER_PASSWORD: process.env.TWITTER_PASSWORD,
  TWITTER_EMAIL: process.env.TWITTER_EMAIL,
  TWITTER_API_KEY: process.env.TWITTER_API_KEY,
  TWITTER_API_SECRET_KEY: process.env.TWITTER_API_SECRET_KEY,
  TWITTER_ACCESS_TOKEN: process.env.TWITTER_ACCESS_TOKEN,
  TWITTER_ACCESS_TOKEN_SECRET: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  PROXY_URL: process.env.PROXY_URL,
  DEBUG: process.env.DEBUG === "true",
};

// Validate environment
export function validateEnv(): void {
  const requiredVars: (keyof Config)[] = [
    "TWITTER_API_KEY",
    "TWITTER_API_SECRET_KEY",
    "TWITTER_ACCESS_TOKEN",
    "TWITTER_ACCESS_TOKEN_SECRET",
  ];

  const recommendedVars: (keyof Config)[] = ["PROXY_URL", "DEBUG"];

  const missingRequired = requiredVars.filter((v) => !config[v]);
  if (missingRequired.length > 0) {
    logger.error(
      `Missing required variables: ${missingRequired.join(", ")}. Some functionality may not work.`,
    );
  }

  const missingRecommended = recommendedVars.filter((v) => !config[v]);
  if (missingRecommended.length > 0) {
    logger.warn(
      `Missing recommended variables: ${missingRecommended.join(", ")}. Using defaults.`,
    );
  }
}

// Debug startup message
if (config.DEBUG) {
  logger.info("Starting Twitter MCP with debug mode enabled");
}
