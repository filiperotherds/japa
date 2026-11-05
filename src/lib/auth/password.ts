import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

// scrypt nativo do Node: sem dependência nativa (bcrypt/argon2) para compilar na Vercel.
const N = 16384;
const r = 8;
const p = 1;
const KEYLEN = 64;

function derive(password: string, salt: Buffer, n: number, rr: number, pp: number) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(
      password.normalize("NFKC"),
      salt,
      KEYLEN,
      { N: n, r: rr, p: pp, maxmem: 64 * 1024 * 1024 },
      (err, key) => (err ? reject(err) : resolve(key)),
    );
  });
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = await derive(password, salt, N, r, p);
  return ["scrypt", N, r, p, salt.toString("base64"), key.toString("base64")].join("$");
}

export async function verifyPassword(password: string, stored: string) {
  const [alg, n, rr, pp, saltB64, keyB64] = stored.split("$");
  if (alg !== "scrypt" || !saltB64 || !keyB64) return false;
  const expected = Buffer.from(keyB64, "base64");
  const key = await derive(password, Buffer.from(saltB64, "base64"), +n, +rr, +pp);
  return key.length === expected.length && timingSafeEqual(key, expected);
}
