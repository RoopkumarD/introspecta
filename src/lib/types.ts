export interface LocalEncryptedEntries {
  id: string;
  entry: Uint8Array;
  lastSyncTime: number | null;
}

export interface EncryptedEntries {
  id: string;
  entry: Uint8Array;
  lastSyncTime: number;
}

// [title, content, timestamp, journalName]
export type entry = [string, string, number, string];

// [id, entry, lastSyncTime]
export type serialisedEntries = [string, Uint8Array, number];

export interface EntryType {
  id: string;
  title: string;
  content: string;
  timestamp: number;
  notebook: string;
}

export interface Entries {
  [idVal: string]: EntryType;
}
