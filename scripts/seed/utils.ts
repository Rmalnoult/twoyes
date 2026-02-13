import * as fs from 'fs';
import * as path from 'path';

export const DATA_DIR = path.join(__dirname, 'data');
export const OUTPUT_DIR = path.join(__dirname, 'output');

export function ensureDirs() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

export function normalize(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function capitalize(name: string): string {
  if (!name) return name;
  // Handle hyphenated names: Jean-Pierre
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('-');
}

export function escapeSql(str: string): string {
  return str.replace(/'/g, "''");
}

export function progress(current: number, total: number, label: string) {
  const pct = Math.round((current / total) * 100);
  const bar = '='.repeat(Math.floor(pct / 2)).padEnd(50, ' ');
  process.stdout.write(`\r[${bar}] ${pct}% ${label} (${current}/${total})`);
  if (current === total) process.stdout.write('\n');
}

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function readJsonFile<T>(filepath: string): T | null {
  try {
    const content = fs.readFileSync(filepath, 'utf-8');
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

export function writeJsonFile(filepath: string, data: unknown) {
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
}
