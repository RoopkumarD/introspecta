<script lang="ts">
  import type { PageData } from "./$types";
  import type { serialisedEntries, EncryptedEntries } from "$lib/types";
  import ThemeChooser from "$lib/components/ThemeChooser.svelte";
  import GoogleButton from "$lib/components/GoogleButton.svelte";
  import { CLIENT_ID } from "$lib/googleDrive";
  import { getFileMetadata, downloadFile } from "$lib/googleDrive";
  import { createStore, setMany } from "idb-keyval";
  import { deserialiseDriveData, hashData } from "$lib/utils";
  import { pack } from "msgpackr";
  import DiaryExistsBox from "$lib/components/Unlock-Create/DiaryExistsBox.svelte";

  export let data: PageData;

  interface States {
    [stateName: string]: {
      [actionName: string]: State;
    };
  }

  const states: States = {
    login: {
      gotAccessToken: "importing",
      err: "errShow",
    },
    importing: {
      successImport: "doneImport",
      errWhileImport: "errShow",
    },
    doneImport: {},
    errShow: {},
  };

  type State = "login" | "importing" | "doneImport" | "errShow";

  let state: State = "login";

  // to show err message in errShow state
  let errMessage = "";

  function changeState(currentState: string, action: string) {
    return states[currentState][action];
  }

  const entriesStore = createStore("introspecta", "entries");

  async function importDiaryMetaData() {
    let metaDatas: {
      id: string;
      modifiedTime: string;
      pubKey: string;
      entries: string;
    } | null = null;
    try {
      metaDatas = await getFileMetadata();
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === "errListFile") {
          errMessage = "Err while finding introspecta file";
          state = changeState(state, "errWhileImport");
          return;
        } else if (err.message === "responseFieldsUndefined") {
          errMessage =
            "Response from google drive didn't include important data, internal problem";
          state = changeState(state, "errWhileImport");
          return;
        } else if (err.message === "entriesNotStored") {
          errMessage =
            "File data is modified by someone, please reach out to me";
          state = changeState(state, "errWhileImport");
          return;
        } else if (err.message === "pubKeyNotStored") {
          errMessage =
            "File data doesn't contain pubKey, please reach out to me";
          state = changeState(state, "errWhileImport");
          return;
        }
      } else {
        errMessage = "error catch is not Error object, internal problem";
        state = changeState(state, "errWhileImport");
        return;
      }
    }

    if (metaDatas === null) {
      errMessage = "introspecta file doesn't exists";
      state = changeState(state, "errWhileImport");
      return;
    }

    let pubKey = metaDatas.pubKey;
    let dataFileId = metaDatas.id;
    let modifiedTime = metaDatas.modifiedTime;

    let retrieveData: serialisedEntries[] = [];
    try {
      retrieveData = await downloadFile(dataFileId);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === "errDownloadData") {
          errMessage = "Got err while trying to retrieve data";
          state = changeState(state, "errWhileImport");
          return;
        } else if (err.message === "errWhileUnpackingBuffer") {
          errMessage =
            "Wasn't able to deserialise the data got from drive, internal problem";
          state = changeState(state, "errWhileImport");
          return;
        } else if (err.message === "notAuthorized") {
          errMessage =
            "Please login so that drive allows me to add data to their storage";
          state = changeState(state, "errWhileImport");
          return;
        }
      } else {
        errMessage = "error catch is not Error object, internal problem";
        state = changeState(state, "errWhileImport");
        return;
      }
    }

    let data = deserialiseDriveData(retrieveData);

    const dataHash = await hashData(pack(data));

    if (dataHash === null) {
      errMessage = "Err hashing data";
      state = changeState(state, "errWhileImport");
      return;
    }

    let setData: [string, EncryptedEntries][] = data.map((val) => {
      return [val.id, val];
    });

    if (setData.length !== 0) {
      try {
        await setMany(setData, entriesStore);
      } catch (err) {
        console.error(err);
        errMessage =
          "Err while updating local data, in case of file is modified";
        state = changeState(state, "errWhileImport");
        return;
      }
    }

    localStorage.setItem("fileId", dataFileId);
    localStorage.setItem("lastSyncTime", modifiedTime);
    localStorage.setItem("dataHash", dataHash);
    localStorage.setItem("pubKey", pubKey);

    state = changeState(state, "successImport");
    return;
  }

  async function getAccessToken() {
    if (window.google === undefined) {
      errMessage = "Google GSI is not loaded properly, internal problem";
      state = changeState(state, "err");
      return;
    }

    let clientInit = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: "https://www.googleapis.com/auth/drive.file",
      callback: (res) => {
        if (res.error) {
          errMessage = "Err while authorizing, to get access token";
          console.error(res.error);
          state = changeState(state, "err");
          return;
        }

        state = changeState(state, "gotAccessToken");
        importDiaryMetaData();
      },
    });

    clientInit.requestAccessToken();
  }
</script>

<nav class="flex justify-between items-center px-4 pt-4 xl:px-8">
  <h1 class="font-abrilFatFace text-xl">
    introspecta<span class="bg-primary ml-2 p-1 rounded-md text-sm">beta</span>
  </h1>
  <ThemeChooser />
</nav>

<main
  class="flex flex-col items-center mt-10
  "
>
  <h1 class="font-bold mb-6 text-2xl lg:text-3xl text-center">Import Diary</h1>
  {#if data.diaryExists === true}
    <DiaryExistsBox />
  {/if}
  {#if state === "login"}
    <p class="font-medium mb-4">Choose Google Drive Account:</p>
    <GoogleButton bind:disabled={data.diaryExists} {getAccessToken} />
    <a href="/unlock-diary" class="btn btn-link btn-lg text-accent mt-10"
      >Return back to unlock-diary</a
    >
  {/if}
  {#if state === "errShow"}
    <p class="font-bold text-accent text-3xl">Err!!!</p>
    <p class="font-medium text-xl">{errMessage}</p>
  {/if}
  {#if state === "importing"}
    <p class="font-bold text-4xl">Importing...</p>
  {/if}
  {#if state === "doneImport"}
    <p class="font-bold text-xl">Imported the diary</p>
    <p class="font-medium mt-4 text-xl">
      Now you can visit /unlock-diary and continue
    </p>
    <a href="/unlock-diary" class="btn btn-link btn-lg text-accent"
      >Return back to unlock-diary</a
    >
  {/if}
</main>
