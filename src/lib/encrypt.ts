import sodium from "libsodium-wrappers";

async function encryptLog(entry: Uint8Array, pubKey: string) {
  const encrypted = sodium.crypto_box_seal(entry, sodium.from_hex(pubKey));
  return { encrypted: encrypted };
}

export { encryptLog };
