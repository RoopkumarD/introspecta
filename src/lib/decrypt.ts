import { expose } from "comlink";
import sodium, { ready as sodiumReady } from "libsodium-wrappers";
// import { decode } from "msgpack-lite";
import { unpack } from "msgpackr";

interface EncryptedEntries {
  id: string;
  entry: Uint8Array;
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

const workerApi = {
  decrypt: decrypt,
  generateKeyPairs: generateKeyPairs,
};

(async () => {
  await sodiumReady;

  expose(workerApi);
})();

async function generateKeyPairs(passphrase: string) {
  const encoder = new TextEncoder();
  const passBuf = encoder.encode(passphrase);

  const seed = sodium.crypto_generichash(sodium.crypto_box_SEEDBYTES, passBuf);
  const { publicKey } = sodium.crypto_box_seed_keypair(seed);

  return {
    publicKey: sodium.to_hex(publicKey),
  };
}

async function decrypt(
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
    decrypted.push({
      id: logs[i].id,
      log: unpack(decryptedTextBuf),
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
