import { json } from "@sveltejs/kit";
import type { RequestHandler } from "@sveltejs/kit";

import { drive, auth } from "@googleapis/drive";
import { CLIENT_ID, CLIENT_SECRET } from "$env/static/private";

const authValidator = new auth.OAuth2(CLIENT_ID, CLIENT_SECRET);

export const POST: RequestHandler = async ({ request }) => {
  const { accessToken } = await request.json();
  authValidator.setCredentials({ access_token: accessToken });

  const service = drive({ version: "v3", auth: authValidator });

  try {
    const response = await service.files.list({
      q: "name = 'introspecta-app-data' and mimeType = 'application/vnd.google-apps.folder'",
      fields: "files(id, name)",
      spaces: "drive",
    });

    if (response.data.files === undefined) {
      throw "response.data.files is undefined";
    }

    if (response.data.files.length === 0) {
      return json({ dataExists: false, folderId: "" });
    } else {
      return json({ dataExists: true, folderId: response.data.files[0].id });
    }
  } catch (err) {
    throw err; // throwing err so that it sends 5xx err msg to client and there i can show the error message
    // i know this is lazy, will see this later when error correcting
  }
};
