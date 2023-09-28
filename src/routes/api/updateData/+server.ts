import { json } from "@sveltejs/kit";
import type { RequestHandler } from "@sveltejs/kit";

import { drive, auth } from "@googleapis/drive";
import { CLIENT_ID, CLIENT_SECRET } from "$env/static/private";

import { Readable } from "node:stream";

const authValidator = new auth.OAuth2(CLIENT_ID, CLIENT_SECRET);

export const POST: RequestHandler = async ({ request }) => {
  const data = await request.formData();
  const val = data.get("data") as File;
  const accessToken = data.get("accessToken") as string;
  const pubKey = data.get("pubKey") as string;
  authValidator.setCredentials({ access_token: accessToken });

  const dataArrBuffer = new Uint8Array(await val.arrayBuffer());
  const bufferStream = new Readable();
  bufferStream.push(dataArrBuffer);
  bufferStream.push(null);

  // deleting previous data
  await deleteFolder(authValidator);

  // creating folder with name introspecta-app-data
  const folderId = (await createIntrospectaFolder(authValidator)) as string;

  // uploads the new data to folder
  const fileId = await addData(folderId, authValidator, bufferStream, pubKey);

  return json({
    fileId: fileId,
  });
};

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
    console.log(err);
    return;
  }
}

async function addData(
  folderId: string,
  auth: typeof authValidator,
  data: Readable,
  pubKey: string,
) {
  const service = drive({ version: "v3", auth: auth });
  let fileId = "";

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
      fields: "id",
    });

    fileId = file.data.id;
  } catch (err) {
    console.log(err);
    return;
  }

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
    console.log(err);
    return;
  }

  return fileId;
}

async function deleteFolder(auth: typeof authValidator) {
  const service = drive({ version: "v3", auth: auth });
  let folderId = "";

  // first checking if folder exists or not
  try {
    const res = await service.files.list({
      q: "mimeType='application/vnd.google-apps.folder' and name='introspecta-app-data'",
      fields: "files(id, name)",
      spaces: "drive",
    });

    if (res.data.files === undefined) {
      console.log("data.files is undefined");
      return;
    }

    if (res.data.files.length === 0) {
      return;
    }

    folderId = res.data.files[0].id as string;
  } catch (err) {
    console.log(err);
    return;
  }

  // if folder exists, then deleting it and it's content
  try {
    await service.files.delete({
      fileId: folderId,
    });
  } catch (err) {
    console.log(err);
    return;
  }

  return;
}
