import { randomBytes } from 'crypto';

const ALPHABET =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

const DIGITS = '0123456789';

export function numericId(size = 10): string {
  const bytes = randomBytes(size);
  let id = '';
  for (let i = 0; i < size; i++) {
    id += DIGITS[bytes[i] % DIGITS.length];
  }
  return id;
}

export function nanoid(size = 21): string {
  const bytes = randomBytes(size);
  let id = '';
  for (let i = 0; i < size; i++) {
    id += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return id;
}
