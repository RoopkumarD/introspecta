export interface EncryptedEntry {
  id: string;
  entry: Uint8Array;
  lastSyncTime: number | null;
}
