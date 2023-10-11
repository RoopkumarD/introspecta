import sodium from "libsodium-wrappers";
import { unpack } from "msgpackr";
import type { EncryptedEntries, entry } from "$lib/types";

export async function generateKeyPairs(passphrase: string) {
  const encoder = new TextEncoder();
  const passBuf = encoder.encode(passphrase);

  const seed = sodium.crypto_generichash(sodium.crypto_box_SEEDBYTES, passBuf);
  const { publicKey } = sodium.crypto_box_seed_keypair(seed);

  return {
    publicKey: sodium.to_hex(publicKey),
  };
}

export async function encryptLog(entry: Uint8Array, pubKey: string) {
  const encrypted = sodium.crypto_box_seal(entry, sodium.from_hex(pubKey));
  return { encrypted: encrypted };
}

interface DecryptedLogs {
  id: string;
  log: {
    title: string;
    content: string;
    timestamp: number;
    journal: string;
  };
}

interface SortedJournals {
  [journalName: string]: DecryptedLogs[];
}

export async function decrypt(
  passphrase: string,
  encryptedEntries: EncryptedEntries[],
) {
  const { publicKey, privateKey } = await retrieveKeyPairs(passphrase);

  let decryptedLogs = await decryptingAllLogs(
    publicKey,
    privateKey,
    encryptedEntries,
  );

  decryptedLogs.sort((a, b) => b.log.timestamp - a.log.timestamp);

  let journals = sortIntoJournals(decryptedLogs);

  return {
    decryptedEntries: journals,
  };
}

function sortIntoJournals(decryptedLogs: DecryptedLogs[]) {
  let sortedJournals: SortedJournals = {};

  decryptedLogs.forEach((entry) => {
    const journalName = entry.log.journal;

    if (!sortedJournals[journalName]) {
      sortedJournals[journalName] = [];
    }

    sortedJournals[journalName].push({
      id: entry.id,
      log: entry.log,
    });
  });

  return sortedJournals;
}

async function decryptingAllLogs(
  publicKey: Uint8Array,
  privateKey: Uint8Array,
  logs: EncryptedEntries[],
) {
  const length = logs.length;
  const decrypted: DecryptedLogs[] = [];

  for (let i = 0; i < length; i++) {
    const decryptedTextBuf = sodium.crypto_box_seal_open(
      logs[i].entry,
      publicKey,
      privateKey,
    );

    const log: entry = unpack(decryptedTextBuf);
    decrypted.push({
      id: logs[i].id,
      log: {
        title: log[0],
        content: log[1],
        timestamp: log[2],
        journal: log[3],
      },
    });
  }

  return decrypted;
}

async function retrieveKeyPairs(passphrase: string) {
  const encoder = new TextEncoder();
  const passBuf = encoder.encode(passphrase);

  const seed = sodium.crypto_generichash(sodium.crypto_box_SEEDBYTES, passBuf);

  const { publicKey, privateKey } = sodium.crypto_box_seed_keypair(seed);

  return { publicKey: publicKey, privateKey: privateKey };
}
