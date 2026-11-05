import "server-only";

/** Instante da requisição. Server Components aqui são dinâmicos (renderizados a cada requisição). */
export function requestTime() {
  return Date.now();
}
