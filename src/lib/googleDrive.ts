import type { EncryptedEntries } from "$lib/types";
import { PUBLIC_API_KEY, PUBLIC_CLIENT_ID } from "$env/static/public";
import { pack, unpack } from "msgpackr";

export const CLIENT_ID = PUBLIC_CLIENT_ID;
export const API_KEY = PUBLIC_API_KEY;
export const DISCOVERY_DOC =
  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest";
export const SCOPES = "https://www.googleapis.com/auth/drive.file";

// string -> fileId, 'err' -> err while getting, null -> no folder/file found

export async function getFolderId(): Promise<string | "errListFolder" | null> {
  let folderResponse;
  try {
    folderResponse = await gapi.client.drive.files.list({
      q: `name = 'introspecta-app-data' and mimeType = 'application/vnd.google-apps.folder'`,
      fields: "files(id, name)",
    });
  } catch (err) {
    console.error(err);
    return "errListFolder";
  }

  const { files } = JSON.parse(folderResponse.body);

  if (!files || files.length === 0) {
    return null;
  } else {
    return files[0].id;
  }
}

export async function downloadPubKeyFile(): Promise<
  | { pubKey: string; dataFileId: string }
  | "errListFolder"
  | "errListPubKey"
  | "errDownloadPubkey"
  | null
> {
  const folderId = await getFolderId();

  if (folderId === null) {
    return null;
  } else if (folderId === "errListFolder") {
    return "errListFolder";
  }

  let fileResponse;
  try {
    fileResponse = await gapi.client.drive.files.list({
      q: `name = 'introspecta-pubKey.json' and '${folderId}' in parents and mimeType = 'application/json'`,
      fields: "files(id, name)",
    });
  } catch (err) {
    console.error(err);
    return "errListPubKey";
  }

  const { files } = JSON.parse(fileResponse.body);

  if (!files || files.length === 0) {
    return null;
  }

  let response;
  try {
    response = await gapi.client.drive.files.get({
      fileId: files[0].id,
      alt: "media",
    });
  } catch (err) {
    console.error(err);
    return "errDownloadPubkey";
  }

  const data: { pubKey: string; dataFileId: string } = JSON.parse(
    response.body,
  );

  return data;
}

export async function downloadFile(
  fileId: string,
): Promise<
  | EncryptedEntries[]
  | "errDownloadData"
  | "errWhileUnpackingBuffer"
  | "notAuthorized"
> {
  let accessTokenObj = gapi.auth.getToken();
  if (accessTokenObj === null) {
    return "notAuthorized";
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
    return "errDownloadData";
  }

  const data = await response.arrayBuffer();
  const uint = new Uint8Array(data);

  let dataArr: EncryptedEntries[];
  try {
    dataArr = unpack(uint);
  } catch (err) {
    console.error(err);
    return "errWhileUnpackingBuffer";
  }

  return dataArr;
}

export async function getModifiedTime(
  fileId: string,
): Promise<string | "err" | "errResultFieldMissing"> {
  let response;
  try {
    response = await gapi.client.drive.files.get({
      fileId: fileId,
      fields: "modifiedTime",
    });
  } catch (err) {
    console.error(err);
    return "err";
  }

  if (response.result.modifiedTime === undefined) {
    return "errResultFieldMissing";
  }

  return response.result.modifiedTime;
}

export function revokeAccessToken() {
  const token = gapi.client.getToken();
  if (token !== null) {
    window.google?.accounts.oauth2.revoke(token.access_token);
    gapi.client.setToken(null);
  }
}

export async function deleteIntrospectaFolder(
  folderId: string,
): Promise<"success" | "err"> {
  try {
    await gapi.client.drive.files.delete({
      fileId: folderId,
    });

    return "success";
  } catch (err) {
    console.error(err);
    return "err";
  }
}

export async function createIntrospectaFolder(): Promise<
  "errFolderCreate" | "errNoIdResult" | string
> {
  const fileMetaData = {
    name: "introspecta-app-data",
    mimeType: "application/vnd.google-apps.folder",
  };

  let response;
  try {
    response = await gapi.client.drive.files.create({
      resource: fileMetaData,
      fields: "id",
    });
  } catch (err) {
    console.error(err);
    return "errFolderCreate";
  }

  if (response.result.id === undefined) {
    console.error(
      "Bro result field of response doesn't have id data of folder",
    );
    return "errNoIdResult";
  }

  return response.result.id;
}

export async function uploadPubkeyToDrive(
  folderId: string,
  pubKey: string,
  dataFileId: string,
): Promise<"notAuthorized" | "errUpload" | "success"> {
  const jsonData: { pubKey: string; dataFileId: string } = {
    pubKey: pubKey,
    dataFileId: dataFileId,
  };
  const file = new Blob([JSON.stringify(jsonData)], {
    type: "application/json",
  });
  const metadata = {
    name: "introspecta-pubKey.json",
    mimeType: "application/json",
    parents: [folderId],
  };

  const accessTokenObj = gapi.auth.getToken();

  if (accessTokenObj === null) {
    console.error("user is not authorized");
    return "notAuthorized";
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
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
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
    return "errUpload";
  }

  return "success";
}

export async function uploadDataToDrive(
  folderId: string,
  dataArr: EncryptedEntries[],
): Promise<
  "notAuthorized" | "errUpload" | { id: string; modifiedTime: string }
> {
  const serialisedData = pack(dataArr);
  const file = new Blob([serialisedData], { type: "application/msgpack" });
  const metadata = {
    name: "introspecta-data.msp",
    mimeType: "application/msgpack",
    parents: [folderId],
  };

  const accessTokenObj = gapi.auth.getToken();

  if (accessTokenObj === null) {
    console.error("user is not authorized");
    return "notAuthorized";
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
    return "errUpload";
  }

  const data = await response.json();
  return { id: data.id, modifiedTime: data.modifiedTime };
}

export async function updateDataOfDrive(
  fileId: string,
  dataArr: EncryptedEntries[],
): Promise<"notAuthorized" | "errUpload" | { modifiedTime: string }> {
  const serialisedData = pack(dataArr);

  const accessTokenObj = gapi.auth.getToken();

  if (accessTokenObj === null) {
    console.error("user is not authorized");
    return "notAuthorized";
  }

  let response;
  try {
    response = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media&fields=modifiedTime`,
      {
        method: "PATCH",
        headers: {
          Authorization: "Bearer " + accessTokenObj.access_token,
        },
        body: serialisedData,
      },
    );
  } catch (err) {
    console.error(err);
    return "errUpload";
  }

  const data = await response.json();
  return { modifiedTime: data.modifiedTime };
}
