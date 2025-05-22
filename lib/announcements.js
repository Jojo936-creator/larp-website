import fs from 'fs';
import path from 'path';

const ANNOUNCEMENTS_PATH = path.join(process.cwd(), 'config', 'announcements.json');

export function getAnnouncements() {
  if (!fs.existsSync(ANNOUNCEMENTS_PATH)) return [];
  const data = fs.readFileSync(ANNOUNCEMENTS_PATH, 'utf-8');
  return JSON.parse(data);
}

export function saveAnnouncements(announcements) {
  fs.writeFileSync(ANNOUNCEMENTS_PATH, JSON.stringify(announcements, null, 2), 'utf-8');
}
