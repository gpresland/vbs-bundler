/**
 * Pad left.
 * @param value The value to pad.
 * @param length The minimum length of the string to return.
 * @param char The character to use for padding.
 * @returns The padded string.
 */
export function padStart(value: string, length: number, char: string) {
  return (char.repeat(length) + value).slice(-length);
}

/**
 * Pad right.
 * @param value The value to pad.
 * @param length The minimum length of the string to return.
 * @param char The character to use for padding.
 * @returns The padded string.
 */
export function padEnd(value: string, length: number, char: string) {
  return (value + char.repeat(length)).substr(0, length);
}
