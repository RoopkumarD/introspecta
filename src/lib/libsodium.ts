import sodium from "libsodium-wrappers";
import { unpack } from "msgpackr";
import type { EncryptedEntries, entry, Entries } from "$lib/types";

export async function sodiumReady() {
  await sodium.ready;
  return;
}

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

export async function decrypt(
  passphrase: string,
  encryptedEntries: EncryptedEntries[],
) {
  const { publicKey, privateKey } = await retrieveKeyPairs(passphrase);

  let { decrypted, notebooks } = await decryptingAllLogs(
    publicKey,
    privateKey,
    encryptedEntries,
  );

  decrypted.sort((a, b) => b.timestamp - a.timestamp);

  let journals = sortIntoJournals(decrypted);

  return {
    decryptedEntries: journals,
    notebooksFromDecrypted: notebooks,
  };
}

interface DecryptedLogs {
  id: string;
  title: string;
  content: string;
  timestamp: number;
  notebook: string;
}

function sortIntoJournals(decryptedLogs: DecryptedLogs[]) {
  let sortedJournals: Entries = {};

  decryptedLogs.forEach((entry) => {
    sortedJournals[entry.id] = entry;
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
  const notebooks: string[] = [];

  for (let i = 0; i < length; i++) {
    const decryptedTextBuf = sodium.crypto_box_seal_open(
      logs[i].entry,
      publicKey,
      privateKey,
    );

    const log: entry = unpack(decryptedTextBuf);
    decrypted.push({
      id: logs[i].id,
      title: log[0],
      content: log[1],
      timestamp: log[2],
      notebook: log[3],
    });

    if (!notebooks.includes(log[3])) {
      notebooks.push(log[3]);
    }
  }

  return { decrypted, notebooks };
}

async function retrieveKeyPairs(passphrase: string) {
  const encoder = new TextEncoder();
  const passBuf = encoder.encode(passphrase);

  const seed = sodium.crypto_generichash(sodium.crypto_box_SEEDBYTES, passBuf);

  const { publicKey, privateKey } = sodium.crypto_box_seed_keypair(seed);

  return { publicKey: publicKey, privateKey: privateKey };
}
