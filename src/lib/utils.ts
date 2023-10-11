import type { EncryptedEntries, serialisedEntries } from "$lib/types";

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

export function genShortUUID() {
  const uuid = crypto.randomUUID();
  const shortenedId = btoa(uuid).slice(0, 10);

  return shortenedId;
}

export function serialiseDataForDrive(dataArr: EncryptedEntries[]) {
  let serialisedArr: serialisedEntries[] = dataArr.map((data) => {
    return [data.id, data.entry, data.lastSyncTime];
  });

  return serialisedArr;
}

export function deserialiseDriveData(dataArr: serialisedEntries[]) {
  let deserialisedArr: EncryptedEntries[] = dataArr.map((data) => {
    return {
      id: data[0],
      entry: data[1],
      lastSyncTime: data[2],
    };
  });

  return deserialisedArr;
}
