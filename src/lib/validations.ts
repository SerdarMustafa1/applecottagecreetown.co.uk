export function validateEmail(value: string) {
  return /\S+@\S+\.\S+/.test(value);
}
