// URL do Postgres para scripts (migração/seed). Prefere a conexão direta:
// o Neon na Vercel expõe DATABASE_URL (pooler) e DATABASE_URL_UNPOOLED (direta).
export const scriptDbUrl =
  process.env.DATABASE_URL_UNPOOLED ??
  process.env.POSTGRES_URL_NON_POOLING ??
  process.env.DATABASE_URL ??
  process.env.POSTGRES_URL;
