# Navalha

Agenda online multi-tenant para barbearias. Cada barbearia é uma organização com vários barbeiros; o cliente cria uma conta, vê a agenda inteira do barbeiro (livre, ocupado, fechado) e reserva.

Stack: Next.js 16 (App Router, Server Actions) · Postgres + Drizzle ORM · Tailwind 4 · Vercel Blob para fotos. Tudo roda na Vercel.

## Rodar localmente

```bash
npm install
npm run dev
```

Sem `DATABASE_URL`, o app usa **PGlite** (Postgres em WASM) gravando em `.pglite/`. O `predev` aplica as migrações e cria a barbearia demo na primeira vez. Nada para instalar.

- Landing: http://localhost:3000
- Barbearia demo: http://localhost:3000/casa-brava
- Contas demo (senha `demo1234`): `rafa@example.com` (dono e barbeiro), `diego@example.com` e `jonas@example.com` (barbeiros), `cliente@example.com` (cliente)
- Zerar o banco local: `npm run db:reset`

O PGlite aceita um processo por vez: pare o `npm run dev` antes de rodar `db:migrate`/`db:reset`.

## Deploy na Vercel

Passo a passo completo em **[DEPLOY.md](DEPLOY.md)**. Em resumo: importar o repositório na Vercel, conectar um Postgres Neon e um Blob store público em *Storage*, e refazer o deploy. O `vercel.json` aplica as migrações a cada build.

## Como funciona

| Conceito | Onde |
| --- | --- |
| Tenant (barbearia) | `organizations`, URL `/{slug}` |
| Papéis | `memberships.role`: `owner` gerencia equipe/serviços/configurações; `barber` gerencia a própria agenda |
| Perfil do barbeiro | `barbers` (bio, @instagram, especialidades, foto) + `barber_photos` (portfólio) |
| Expediente | `working_hours` (minutos desde meia-noite, no fuso da barbearia; 2 turnos por dia) |
| Reservas e bloqueios | `appointments` (`kind` = `booking` ou `block`) |
| Convites | `invites`: link de uso único, 7 dias |

**Sem horário duplicado.** A tabela `appointments` tem uma constraint de exclusão (`drizzle/0001_no_overlap.sql`): o Postgres recusa dois compromissos sobrepostos para o mesmo barbeiro, mesmo com cliques simultâneos. A tela trata o erro e atualiza a agenda.

**Privacidade.** A agenda pública mostra só "Ocupado". Nome, telefone e recado do cliente aparecem apenas no painel do barbeiro e do dono.

**Disponibilidade.** `src/lib/slots.ts` é puro e roda nos dois lados: desenha a agenda no navegador e revalida a reserva no servidor com a mesma regra (expediente, conflitos, antecedência mínima, janela de dias).

**Autenticação.** Sessões próprias: senha com scrypt (`node:crypto`), token aleatório no cookie httpOnly e só o hash SHA-256 no banco.

## Estrutura

```
src/app/page.tsx                 landing
src/app/[slug]/                  página pública da barbearia
src/app/[slug]/[barber]/         perfil do barbeiro + agenda + reserva
src/app/minhas-reservas/         reservas do cliente
src/app/painel/[slug]/           painel (agenda, perfil, horários, equipe, serviços, barbearia)
src/app/convite/[token]/         aceitar convite
src/app/nova-barbearia/          criar barbearia
src/db/                          schema Drizzle, conexão e seed
src/lib/                         auth, tenant, agenda, slots, datas
drizzle/                         migrações SQL
```

## Próximos passos sugeridos

- Lembrete por WhatsApp/e-mail (Vercel Cron + provedor de mensagens).
- Preço e serviços por barbeiro (hoje são da barbearia).
- Login com Google e recuperação de senha (exige provedor de e-mail).
- Limite de tentativas no login (ex.: Upstash Ratelimit).
