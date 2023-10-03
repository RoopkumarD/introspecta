import { json, type RequestHandler } from "@sveltejs/kit";

import { drive, auth } from "@googleapis/drive";
import { CLIENT_ID, CLIENT_SECRET } from "$env/static/private";

const authValidator = new auth.OAuth2(CLIENT_ID, CLIENT_SECRET);

export const POST: RequestHandler = async ({ request }) => {
  const { accessToken } = await request.json();
  authValidator.setCredentials({ access_token: accessToken });

  const { fileId, parentFolderId } = await retrievePubKeyId(authValidator);

  if (fileId === null) {
    return json({ pubKey: "", parentFolderId: "", foundPubkey: false });
  }

  const { pubKey } = await retrievePubKey(fileId, authValidator);

  return json({
    pubKey: pubKey,
    parentFolderId: parentFolderId,
    foundPubkey: true,
  });
};

async function retrievePubKeyId(auth: typeof authValidator) {
  const service = drive({ version: "v3", auth: auth });

  try {
    const res = await service.files.list({
      q: "name = 'introspecta-pubKey.json' and mimeType = 'application/json'",
      fields: "files(id, name, parents)",
      spaces: "drive",
    });

    if (res.data.files === undefined) {
      throw "res.data.files is undefined";
    }

    if (res.data.files.length === 0) {
      return {
        fileId: null,
        parentFolderId: null,
      };
    }

    return {
      fileId: res.data.files[0].id,
      parentFolderId: res.data.files[0].parents,
    };
  } catch (err) {
    throw err;
  }
}

async function retrievePubKey(fileId: string, auth: typeof authValidator) {
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
