export type ClassValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  const append = (item: ClassValue): void => {
    if (!item) return;
    if (typeof item === 'string' || typeof item === 'number') {
      const value = String(item).trim();
      if (value) classes.push(value);
      return;
    }
    if (Array.isArray(item)) {
      for (const child of item) append(child);
    }
  };

  for (const input of inputs) append(input);
  return classes.join(' ');
}
