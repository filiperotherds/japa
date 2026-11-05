"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { firstError, formObject, pgErrorCode, safeNext, type FormState } from "@/lib/forms";

const signUpSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome.").max(80),
  email: z.email("E-mail inválido.").trim().toLowerCase(),
  phone: z.string().trim().max(30).optional(),
  password: z.string().min(8, "A senha precisa de pelo menos 8 caracteres.").max(200),
});

export async function signUp(_: FormState, fd: FormData): Promise<FormState> {
  const fields = formObject(fd);
  const parsed = signUpSchema.safeParse(fields);
  if (!parsed.success) return { error: firstError(parsed.error), fields };
  const { name, email, phone, password } = parsed.data;
  try {
    const [user] = await db
      .insert(users)
      .values({ name, email, phone: phone || null, passwordHash: await hashPassword(password) })
      .returning({ id: users.id });
    await createSession(user.id);
  } catch (e) {
    if (pgErrorCode(e) === "23505") return { error: "Já existe uma conta com esse e-mail.", fields };
    throw e;
  }
  redirect(safeNext(fields.next, "/inicio"));
}

const signInSchema = z.object({
  email: z.string().trim().toLowerCase(),
  password: z.string().min(1, "Informe a senha."),
});

export async function signIn(_: FormState, fd: FormData): Promise<FormState> {
  const fields = formObject(fd);
  const parsed = signInSchema.safeParse(fields);
  if (!parsed.success) return { error: firstError(parsed.error), fields };
  const [user] = await db.select().from(users).where(eq(users.email, parsed.data.email)).limit(1);
  // mesma mensagem para e-mail inexistente e senha errada
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return { error: "E-mail ou senha incorretos.", fields: { email: fields.email ?? "" } };
  }
  await createSession(user.id);
  redirect(safeNext(fields.next, "/inicio"));
}

export async function signOut() {
  await destroySession();
  redirect("/");
}
