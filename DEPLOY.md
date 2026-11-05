# Deploy na Vercel

Tudo roda na Vercel: o app (Next.js), o banco (Postgres do Neon, contratado pelo Marketplace da Vercel) e as fotos (Vercel Blob). Não há servidor próprio.

Tempo estimado: 10 minutos.

## Pré-requisitos

- Este repositório no GitHub.
- Conta na Vercel (o plano Hobby serve para testar; para uso comercial a Vercel exige o plano Pro).

## 1. Importar o projeto

1. Acesse **vercel.com/new** e escolha **Import Git Repository**. Selecione este repositório.
2. Confira as configurações (os padrões já servem):
   - **Framework Preset:** Next.js
   - **Root Directory:** `./`
   - **Build Command:** não altere. O `vercel.json` já define `npm run db:migrate && npm run build`.
3. Clique em **Deploy**.

**O primeiro deploy vai falhar, e isso é esperado:** ainda não existe banco. O log mostra `DATABASE_URL não configurada`. Siga para o passo 2.

## 2. Conectar o banco (Neon)

1. No projeto, abra a aba **Storage** e clique em **Create Database**.
2. Escolha **Neon** (Serverless Postgres) e uma região próxima dos clientes (ex.: `São Paulo` ou `US East`). Use a mesma região das Functions (passo 5).
3. Em **Connect Project**, marque os ambientes **Production**, **Preview** e **Development**.
   - Recomendado: ative a opção de **criar um branch do banco para cada Preview**. Sem ela, os deploys de preview usam o banco de produção e aplicam migrações nele.
4. A integração cria as variáveis de ambiente, entre elas `DATABASE_URL` (com pooler, usada pelo app) e `DATABASE_URL_UNPOOLED` (conexão direta, usada nas migrações).

A migração habilita a extensão `btree_gist`, que impede horários sobrepostos no banco. O Neon permite isso sem configuração extra.

## 3. Conectar o armazenamento de fotos (Vercel Blob)

1. Ainda em **Storage**, clique em **Create** e escolha **Blob**.
2. **Selecione acesso público (Public).** As fotos de perfil e de portfólio são exibidas por URL pública; um store privado faz o upload falhar.
3. Conecte o store ao projeto, nos três ambientes. Isso cria `BLOB_READ_WRITE_TOKEN`.

## 4. Refazer o deploy

Aba **Deployments**, menu `⋯` do último deploy, **Redeploy**. Agora o build:

1. aplica as migrações em `drizzle/` no Neon;
2. compila o app.

Abra a URL do projeto: a landing aparece em `/`. Crie uma conta, vá em **Criar minha barbearia** e configure serviços, equipe e horários.

## 5. Ajustes recomendados

- **Região das Functions:** em *Settings → Functions*, escolha a mesma região do banco. Cada página consulta o Postgres; com o banco em outro continente, cada consulta paga a latência da viagem.
- **Domínio próprio:** *Settings → Domains*. As barbearias ficam em `seudominio.com/{slug}`.
- **Fuso horário:** toda barbearia nova usa `America/Sao_Paulo`. Para outro fuso, altere a coluna `timezone` em `organizations` (ainda não há campo na tela).

## Variáveis de ambiente

| Variável | Criada por | Uso |
| --- | --- | --- |
| `DATABASE_URL` | Integração Neon | Conexão do app (pooler). Obrigatória. |
| `DATABASE_URL_UNPOOLED` | Integração Neon | Migrações e seed (conexão direta). Opcional: sem ela usa `DATABASE_URL`. |
| `BLOB_READ_WRITE_TOKEN` | Blob store | Upload de avatar e portfólio. Sem ela, o upload falha em produção. |

Supabase também funciona: o app aceita `POSTGRES_URL` e `POSTGRES_URL_NON_POOLING` no lugar das variáveis do Neon.

## Dados de demonstração (opcional)

O seed cria a barbearia `casa-brava`, com três barbeiros, serviços e reservas, e contas `@example.com` com a senha **pública** `demo1234`. Use só em ambiente de demonstração, nunca no banco de produção com clientes reais.

```bash
npm install
npx vercel link
npx vercel env pull .env.local
npm run db:seed
```

## Rodar localmente

```bash
npm install
npm run dev
```

Sem `.env.local`, o app usa o PGlite (Postgres embutido, em `.pglite/`) e cria a demo sozinho. Para apontar o ambiente local para o Neon, rode `npx vercel env pull .env.local` antes.

## Problemas comuns

| Sintoma | Causa e solução |
| --- | --- |
| Build falha com `DATABASE_URL não configurada` | Banco não conectado ao ambiente do deploy. Refaça o passo 2 marcando Production e Preview, depois Redeploy. |
| Build falha em `CREATE EXTENSION btree_gist` | O usuário do banco não pode criar extensões. No Neon não acontece; em outros provedores, habilite `btree_gist` pelo painel. |
| Upload de foto mostra erro | `BLOB_READ_WRITE_TOKEN` ausente, ou o Blob store é privado. Crie um store **público** (passo 3) e faça o redeploy. |
| Upload falha com foto grande | O navegador reduz a imagem antes de enviar; o limite no servidor é 3,5 MB (o corpo de requisição na Vercel vai até 4,5 MB). |
| Páginas lentas | Banco e Functions em regiões diferentes (veja o passo 5). |

## Antes de abrir para clientes reais

Itens que o código ainda não cobre:

- **Recuperação de senha e confirmação de e-mail:** dependem de um provedor de e-mail (ex.: Resend).
- **Limite de tentativas de login:** hoje não há proteção contra força bruta (ex.: Upstash Ratelimit).
- **Termos de uso e política de privacidade:** o app guarda nome, e-mail e telefone dos clientes, o que exige adequação à LGPD.
- **Backups:** confira a retenção de histórico do plano Neon (restauração para um ponto no tempo).
