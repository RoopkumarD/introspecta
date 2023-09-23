import { expose } from "comlink";
import sodium, { ready as sodiumReady } from "libsodium-wrappers";

const workerApi = {
  encryptLog: encryptLog,
};

(async () => {
  await sodiumReady;

  expose(workerApi);
})();

async function encryptLog(entry: string, pubKey: string) {
  const encoder = new TextEncoder();
  const entryBuf = encoder.encode(entry);
  const encrypted = sodium.crypto_box_seal(entryBuf, sodium.from_hex(pubKey));
  return { encrypted: sodium.to_hex(encrypted) };
}
