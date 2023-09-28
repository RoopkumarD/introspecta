import { expose } from "comlink";
import sodium, { ready as sodiumReady } from "libsodium-wrappers";

const workerApi = {
  encryptLog: encryptLog,
};

(async () => {
  await sodiumReady;

  expose(workerApi);
})();

async function encryptLog(entry: Buffer, pubKey: string) {
  const encrypted = sodium.crypto_box_seal(entry, sodium.from_hex(pubKey));
  return { encrypted: encrypted };
}
