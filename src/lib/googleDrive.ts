import type { serialisedEntries } from "$lib/types";
import { PUBLIC_API_KEY, PUBLIC_CLIENT_ID } from "$env/static/public";
import { pack, unpack } from "msgpackr";

export const CLIENT_ID = PUBLIC_CLIENT_ID;
export const API_KEY = PUBLIC_API_KEY;
export const DISCOVERY_DOC =
  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest";
export const SCOPES = "https://www.googleapis.com/auth/drive.file";

export async function getAccessToken(callbackFn: (res: TokenResponse) => void) {
  if (window.google === undefined) {
    throw new Error("GSINotLoaded");
  }

  let clientInit = window.google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: "https://www.googleapis.com/auth/drive.file",
    callback: callbackFn,
  });

  clientInit.requestAccessToken();
}

// sends a xhr request to revoke the access token
// Thus would need time to execute this
export function revokeAccessToken() {
  const token = gapi.client.getToken();
  if (token !== null) {
    window.google?.accounts.oauth2.revoke(token.access_token);
    gapi.client.setToken(null);
  }
}

export async function getModifiedTime(fileId: string): Promise<string> {
  let response;
  try {
    response = await gapi.client.drive.files.get({
      fileId: fileId,
      fields: "modifiedTime",
    });
  } catch (err) {
    console.error(err);
    throw new Error("err", { cause: err });
  }

  if (response.result.modifiedTime === undefined) {
    throw new Error("errResultFieldMissing");
  }

  return response.result.modifiedTime;
}

// string -> fileId, 'err' -> err while getting, null -> no folder/file found

export async function getFileMetadata(): Promise<null | {
  id: string;
  modifiedTime: string;
  pubKey: string;
  entries: string;
}> {
  let response;
  try {
    response = await window.gapi.client.drive.files.list({
      q: `name = 'introspecta-app-data.msp' and mimeType = 'application/msgpack' and 'root' in parents and trashed = false`,
      fields: "files(id, name, modifiedTime, appProperties)",
    });
  } catch (err) {
    console.error(err);
    throw new Error("errListFile", { cause: err });
  }

  const files = response.result.files;
  if (!files || files.length == 0) {
    console.log("Files not found");
    return null;
  }

  if (
    files[0].id === undefined ||
    files[0].modifiedTime === undefined ||
    files[0].appProperties === undefined
  ) {
    throw new Error("responseFieldsUndefined");
  }

  if (files[0].appProperties.pubKey === undefined) {
    throw new Error("pubKeyNotStored");
  }

  if (files[0].appProperties.entries === undefined) {
    throw new Error("entriesNotStored");
  }

  return {
    id: files[0].id,
    modifiedTime: files[0].modifiedTime,
    pubKey: files[0].appProperties.pubKey,
    entries: files[0].appProperties.entries,
  };
}

export async function downloadFile(
  fileId: string,
): Promise<serialisedEntries[]> {
  let accessTokenObj = gapi.auth.getToken();
  if (accessTokenObj === null) {
    throw new Error("notAuthorized");
  }

  let apiUrl =
    "https://www.googleapis.com/drive/v3/files/" + fileId + "?alt=media";

  let response;
  try {
    response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + accessTokenObj.access_token,
      },
    });
  } catch (err) {
    console.error(err);
    throw new Error("errDownloadData", { cause: err });
  }

  const data = await response.arrayBuffer();
  const uint = new Uint8Array(data);

  let dataArr: serialisedEntries[];
  try {
    dataArr = unpack(uint);
  } catch (err) {
    console.error(err);
    throw new Error("errWhileUnpackingBuffer", { cause: err });
  }

  return dataArr;
}

export async function deleteIntrospectaFile(
  fileId: string,
): Promise<"success" | "err"> {
  try {
    await gapi.client.drive.files.delete({
      fileId: fileId,
    });

    return "success";
  } catch (err) {
    console.error(err);
    return "err";
  }
}

export async function uploadDataToDrive(
  pubKey: string,
  dataArr: serialisedEntries[],
): Promise<{ id: string; modifiedTime: string }> {
  const entries = dataArr.length.toString();

  const serialisedData = pack(dataArr);
  const file = new Blob([serialisedData], { type: "application/msgpack" });
  const metadata = {
    name: "introspecta-app-data.msp",
    mimeType: "application/msgpack",
    parents: ["root"],
    appProperties: {
      pubKey: pubKey,
      entries: entries,
    },
  };

  const accessTokenObj = gapi.auth.getToken();

  if (accessTokenObj === null) {
    console.error("user is not authorized");
    throw new Error("notAuthorized");
  }

  const form = new FormData();
  form.append(
    "metadata",
    new Blob([JSON.stringify(metadata)], { type: "application/json" }),
  );
  form.append("file", file);

  let response;
  try {
    response = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id%2C%20modifiedTime",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + accessTokenObj.access_token,
        },
        body: form,
      },
    );
  } catch (err) {
    console.error(err);
    throw new Error("errUpload", { cause: err });
  }

  const data = await response.json();
  return { id: data.id, modifiedTime: data.modifiedTime };
}

export async function updateDataOfDrive(
  fileId: string,
  dataArr: serialisedEntries[],
): Promise<{ modifiedTime: string }> {
  const entries = dataArr.length.toString();

  const serialisedData = pack(dataArr);

  const file = new Blob([serialisedData], { type: "application/msgpack" });
  const metadata = {
    appProperties: {
      entries: entries,
    },
  };
  const form = new FormData();
  form.append(
    "metadata",
    new Blob([JSON.stringify(metadata)], { type: "application/json" }),
  );
  form.append("file", file);

  const accessTokenObj = gapi.auth.getToken();

  if (accessTokenObj === null) {
    console.error("user is not authorized");
    throw new Error("notAuthorized");
  }

  let response;
  try {
    response = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart&fields=modifiedTime`,
      {
        method: "PATCH",
        headers: {
          Authorization: "Bearer " + accessTokenObj.access_token,
        },
        body: form,
      },
    );
  } catch (err) {
    console.error(err);
    throw new Error("errUpload", { cause: err });
  }

  const data = await response.json();
  return { modifiedTime: data.modifiedTime };
}
