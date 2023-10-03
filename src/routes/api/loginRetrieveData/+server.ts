import type { RequestHandler } from "@sveltejs/kit";
import { pack, unpack } from "msgpackr";

import { drive, auth } from "@googleapis/drive";
import { CLIENT_ID, CLIENT_SECRET } from "$env/static/private";

const authValidator = new auth.OAuth2(CLIENT_ID, CLIENT_SECRET);

export const POST: RequestHandler = async ({ request }) => {
  const { accessToken, parentFolderId } = await request.json();
  authValidator.setCredentials({ access_token: accessToken });

  const { fileId, modifiedTime } = await getFileId(
    parentFolderId,
    authValidator,
  );

  const blob: Blob = await retrieveData(fileId, authValidator);
  const UintArrBuf = new Uint8Array(await blob.arrayBuffer());

  const resBuf = pack({
    data: unpack(UintArrBuf),
    fileId: fileId,
    modifiedTime: modifiedTime,
  });

  return new Response(resBuf, {
    headers: {
      "Content-Type": "application/msgpack",
    },
  });
};

async function getFileId(parentFolderId: string, auth: typeof authValidator) {
  const service = drive({ version: "v3", auth: auth });

  const query = `name = 'introspecta-data.msp' and mimeType = 'application/msgpack' and '${parentFolderId}' in parents`;

  try {
    const res = await service.files.list({
      q: query,
      fields: "files(id, name, modifiedTime)",
      spaces: "drive",
    });

    if (res.data.files === undefined) {
      throw "res.data.files is undefined";
    }

    return {
      fileId: res.data.files[0].id,
      modifiedTime: res.data.files[0].modifiedTime,
    };
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
