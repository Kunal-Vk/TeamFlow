import postgres from "postgres";
import * as schema from "./schema";
import {env} from "../config/env"
import { drizzle } from "drizzle-orm/postgres-js";

const client=postgres(env.DATABASE_URL);
export const db=drizzle(client,{schema});