import path from 'path';

// Data directory - can be set via environment variable
// Default: ./data in project root
export const DATA_DIR = process.env.WORKSHOP_DATA_DIR || path.join(process.cwd(), 'data');

export const getDataPath = (filename: string) => path.join(DATA_DIR, filename);
