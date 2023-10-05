export async function hashData(dataBuffer: Uint8Array) {
  try {
    const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
    const hashArray = new Uint8Array(hashBuffer);
    const hashHex = Array.from(hashArray)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");

    return hashHex;
  } catch (error) {
    console.error("Error hashing data:", error);
    return null;
  }
}
