// Cria a barbearia de demonstração (casa-brava) no banco apontado por DATABASE_URL.
// No dev local isso já acontece sozinho na primeira execução.
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "../src/db/schema";
import { seed, DEMO_PASSWORD } from "../src/db/seed";
import { scriptDbUrl as url } from "./db-url";

if (!url) {
  console.error("Defina DATABASE_URL (ou rode `vercel env pull .env.local`).");
  process.exit(1);
}

const client = postgres(url, { max: 1, prepare: false });
seed(drizzle(client, { schema }))
  .then(() => console.log(`Demo criada: /casa-brava · contas *@example.com · senha ${DEMO_PASSWORD}`))
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => client.end());
