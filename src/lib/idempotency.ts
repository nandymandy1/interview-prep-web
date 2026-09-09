// One UUID per logical mutating action (create kit, regeneration, manual
// add). The same submission/retry reuses its key; a new intentional click
// mints a new key. The backend turns a repeated key into the original
// result instead of a duplicate Kit, job, question, or flashcard.
export const createIdempotencyKey = (): string => {
  const random = globalThis.crypto?.randomUUID;

  if (typeof random === 'function') {
    return random.call(globalThis.crypto);
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}${Math.random()
    .toString(36)
    .slice(2)}`;
};
