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
