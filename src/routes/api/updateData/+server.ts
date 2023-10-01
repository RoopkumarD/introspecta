import { json } from "@sveltejs/kit";
import type { RequestHandler } from "@sveltejs/kit";
import { unpack, pack } from "msgpackr";

import { drive, auth } from "@googleapis/drive";
import { CLIENT_ID, CLIENT_SECRET } from "$env/static/private";

import { Readable } from "node:stream";

const authValidator = new auth.OAuth2(CLIENT_ID, CLIENT_SECRET);

interface EntriesData {
  id: string;
  entry: Uint8Array;
  lastSyncTime: number;
}

export const POST: RequestHandler = async ({ request }) => {
  const reqArrBuf = await request.arrayBuffer();

  const data: {
    data: EntriesData[];
    accessToken: string;
    fileId: string;
  } = unpack(new Uint8Array(reqArrBuf));
  const accessToken: string = data.accessToken;
  const fileId: string = data.fileId;
  authValidator.setCredentials({ access_token: accessToken });

  const uploadFile = pack(data.data);

  const bufferStream = new Readable();
  bufferStream.push(uploadFile);
  bufferStream.push(null);

  // uploads the new data to folder
  const { modifiedTime } = await addData(fileId, authValidator, bufferStream);

  return json({
    modifiedTime: modifiedTime,
  });
};

async function addData(
  fileId: string,
  auth: typeof authValidator,
  data: Readable,
) {
  const service = drive({ version: "v3", auth: auth });

  const media = {
    mimeType: "application/msgpack",
    body: data,
  };

  try {
    const file = await service.files.update({
      fileId: fileId,
      media: media,
      fields: "modifiedTime",
    });

    if (
      file.data.modifiedTime === null ||
      file.data.modifiedTime === undefined
    ) {
      throw "file.data.modifiedTime is null or undefined";
    }

    return {
      modifiedTime: file.data.modifiedTime,
    };
  } catch (err) {
    throw err;
  }
}
