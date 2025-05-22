import fs from 'fs';
import path from 'path';

export function getCredentials() {
  const filePath = path.join(process.cwd(), 'config', 'credentials.json');
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}
