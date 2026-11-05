import "server-only";
import path from "node:path";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import { btree_gist } from "@electric-sql/pglite/contrib/btree_gist";
import postgres from "postgres";
import * as schema from "./schema";

export type DB = PostgresJsDatabase<typeof schema>;

const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

// Produção (Vercel + Neon/Supabase): Postgres via postgres.js.
// Desenvolvimento sem DATABASE_URL: PGlite (Postgres em WASM) em .pglite/, migrado pelo `predev`.
function connect(): DB {
  if (url) return drizzle(postgres(url, { prepare: false, max: 5 }), { schema });
  if (process.env.NODE_ENV === "production") throw new Error("DATABASE_URL não configurada.");
  const client = new PGlite(path.join(process.cwd(), ".pglite"), { extensions: { btree_gist } });
  return drizzlePglite(client, { schema }) as unknown as DB;
}

// Conexão aberta só na primeira consulta: o Next avalia módulos em processos auxiliares
// (ex.: geração de rotas), e o PGlite não aceita dois processos no mesmo diretório.
const g = globalThis as unknown as { __navalhaDb?: DB };
const instance = () => (g.__navalhaDb ??= connect());

export const db = new Proxy({} as DB, {
  get(_, prop) {
    const real = instance();
    const value = Reflect.get(real, prop, real);
    return typeof value === "function" ? value.bind(real) : value;
  },
});
