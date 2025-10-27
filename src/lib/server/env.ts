import dotenv from "dotenv";

const env = process.env.NODE_ENV || "development";
const envFile = env === "development" || env === "" ? ".env.local" : `.env.${env}`;

console.log(".env:", envFile);
dotenv.config({ path: envFile });
