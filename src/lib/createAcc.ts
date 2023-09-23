import { expose } from "comlink";
import sodium, { ready as sodiumReady } from "libsodium-wrappers";

const workerApi = {
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
