import type { RequestHandler } from "@sveltejs/kit";
import { pack, unpack } from "msgpackr";

import { drive, auth } from "@googleapis/drive";
import { CLIENT_ID, CLIENT_SECRET } from "$env/static/private";

const authValidator = new auth.OAuth2(CLIENT_ID, CLIENT_SECRET);

export const POST: RequestHandler = async ({ request }) => {
  const { accessToken, fileId, lastSyncTime } = await request.json();
  authValidator.setCredentials({ access_token: accessToken });

  const { fileIsModified, modifiedTime } = await checkIfModifiedOrNot(
    fileId,
    lastSyncTime,
    authValidator,
  );

  if (fileIsModified === true) {
    const blob: Blob = await retrieveData(fileId, authValidator);
    const UintArrBuf = new Uint8Array(await blob.arrayBuffer());

    const resBuf = pack({
      data: unpack(UintArrBuf),
      fileIsModified: true,
      modifiedTime: modifiedTime,
    });

    return new Response(resBuf, {
      headers: {
        "Content-Type": "application/msgpack",
      },
    });
  } else {
    const resBuf = pack({
      data: [],
      fileIsModified: false,
      modifiedTime: modifiedTime,
    });
    return new Response(resBuf, {
      headers: {
        "Content-Type": "application/msgpack",
      },
    });
  }
};

async function checkIfModifiedOrNot(
  fileId: string,
  lastSyncTime: string,
  auth: typeof authValidator,
) {
  const service = drive({ version: "v3", auth: auth });

  try {
    const res = await service.files.get({
      fileId: fileId,
      fields: "modifiedTime",
    });

    if (res.data.modifiedTime === undefined || res.data.modifiedTime === null) {
      throw "res.data.modifiedTime is either undefined or null";
    }

    const driveModifiedTime = new Date(res.data.modifiedTime).getTime();
    const localModifiedTime = new Date(lastSyncTime).getTime();

    if (driveModifiedTime > localModifiedTime) {
      return {
        fileIsModified: true,
        modifiedTime: res.data.modifiedTime,
      };
    } else {
      return {
        fileIsModified: false,
        modifiedTime: res.data.modifiedTime,
      };
    }
  } catch (err) {
    throw err;
  }
}

async function retrieveData(fileId: string, auth: typeof authValidator) {
  const service = drive({ version: "v3", auth: auth });

  try {
    const res = await service.files.get({
      fileId: fileId,
      alt: "media",
    });

    return res.data;
  } catch (err) {
    throw err;
  }
}
