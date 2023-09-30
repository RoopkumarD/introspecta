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
    pubKey: string;
    dataExists: boolean;
    folderId: string;
  } = unpack(new Uint8Array(reqArrBuf));
  const accessToken: string = data.accessToken;
  const pubKey: string = data.pubKey;
  const dataExists: boolean = data.dataExists;
  const toDelFolderId = data.folderId;
  authValidator.setCredentials({ access_token: accessToken });

  const uploadFile = pack({
    data: data.data,
    deletes: [],
  });

  const bufferStream = new Readable();
  bufferStream.push(uploadFile);
  bufferStream.push(null);

  // deleting previous data
  if (dataExists === true) {
    await deleteFolder(authValidator, toDelFolderId);
  }

  // creating folder with name introspecta-app-data
  const folderId = (await createIntrospectaFolder(authValidator)) as string;

  // uploads the new data to folder
  const { fileId, modifiedTime } = await addData(
    folderId,
    authValidator,
    bufferStream,
    pubKey,
  );

  return json({
    fileId: fileId,
    modifiedTime: modifiedTime,
  });
};

async function deleteFolder(
  auth: typeof authValidator,
  deleteFolderId: string,
) {
  const service = drive({ version: "v3", auth: auth });

  try {
    await service.files.delete({
      fileId: deleteFolderId,
    });
  } catch (err) {
    throw err;
  }

  return;
}

async function createIntrospectaFolder(auth: typeof authValidator) {
  const service = drive({ version: "v3", auth: auth });

  // let's use introspecta-app-data folder name to store data ( hoping the name to be unique )
  const fileMetaData = {
    name: "introspecta-app-data",
    mimeType: "application/vnd.google-apps.folder",
  };
  try {
    const file = await service.files.create({
      requestBody: fileMetaData,
      fields: "id",
    });

    return file.data.id;
  } catch (err) {
    throw err;
  }
}

async function addData(
  folderId: string,
  auth: typeof authValidator,
  data: Readable,
  pubKey: string,
) {
  const service = drive({ version: "v3", auth: auth });

  try {
    await service.files.create({
      requestBody: {
        name: "introspecta-pubKey.json",
        parents: [folderId],
      },
      media: {
        mimeType: "application/json",
        body: JSON.stringify({ pubKey: pubKey }),
      },
    });
  } catch (err) {
    throw err;
  }

  const media = {
    mimeType: "application/msgpack",
    body: data,
  };

  try {
    const file = await service.files.create({
      requestBody: {
        name: "introspecta-data.msp",
        parents: [folderId],
      },
      media: media,
      fields: "id, modifiedTime",
    });

    if (
      file.data.id === null ||
      file.data.id === undefined ||
      file.data.modifiedTime === null ||
      file.data.modifiedTime === undefined
    ) {
      throw "file.data.id or file.data.modifiedTime is null or undefined";
    }

    return {
      fileId: file.data.id,
      modifiedTime: file.data.modifiedTime,
    };
  } catch (err) {
    throw err;
  }
}
