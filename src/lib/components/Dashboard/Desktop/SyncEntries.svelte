<script lang="ts">
  import {
    createStore,
    keys,
    setMany,
    update,
    values,
    delMany,
  } from "idb-keyval";
  import type { EncryptedEntries } from "$lib/types";
  import { hashData } from "$lib/utils";
  import { pack } from "msgpackr";
  import { journalling, stage } from "$lib/store";
  import {
    getFolderId,
    revokeAccessToken,
    deleteIntrospectaFolder,
    createIntrospectaFolder,
    uploadDataToDrive,
    uploadPubkeyToDrive,
    getModifiedTime,
    downloadFile,
    updateDataOfDrive,
  } from "$lib/googleDrive";
  import { PUBLIC_CLIENT_ID_DEV } from "$env/static/public";

  export let syncModalShow: boolean;

  interface States {
    [stateName: string]: {
      [actionName: string]: State;
    };
  }

  const states: States = {
    login: {
      gotAccessToken: "syncPrompt",
      err: "errShow",
    },
    syncPrompt: {
      clickedSync: "syncing",
      changeAccount: "login",
    },
    syncing: {
      successSync: "doneSync",
      successSyncWithUpdate: "doneSyncWithUpdate",
      errWhileSync: "errShow",
      previousExisitingData: "deleteExistingData",
    },
    deleteExistingData: {
      yesDeleteThem: "syncing",
      changeAccount: "login",
    },
    doneSync: {}, // only close button exists in this state
    doneSyncWithUpdate: {}, // only close button exists in this state
    errShow: {}, // only close button exists in this state
  };

  type State =
    | "login"
    | "syncPrompt"
    | "syncing"
    | "deleteExistingData"
    | "doneSync"
    | "doneSyncWithUpdate"
    | "errShow";

  let state: State = "login";

  // to show err message in errShow state
  let errMessage = "";

  // folderId for new upload if existing data is there
  let folderIdVal = "";

  function changeState(currentState: string, action: string) {
    return states[currentState][action];
  }

  let clientInit: any;

  async function getAccessToken() {
    clientInit = window.google.accounts.oauth2.initTokenClient({
      client_id: PUBLIC_CLIENT_ID_DEV,
      scope: "https://www.googleapis.com/auth/drive.file",
      callback: (res) => {
        if (res.error) {
          errMessage = "Err while authorizing, to get access token";
          console.error(res.error);
          state = changeState(state, "err");
          return;
        }

        // $sync.accessToken = res.access_token;

        state = changeState(state, "gotAccessToken");
      },
    });

    clientInit.requestAccessToken();
  }

  const entriesStore = createStore("introspecta", "entries");

  async function syncTime() {
    state = changeState(state, "clickedSync");

    if (
      localStorage.getItem("lastSyncTime") === null ||
      localStorage.getItem("fileId") === null ||
      localStorage.getItem("dataHash") === null
    ) {
      // first checking if existing data is present on drive or not
      const folderId = await getFolderId();

      if (folderId === null) {
        folderIdVal = "";
        newUpload(false);
      } else if (folderId === "errListFolder") {
        errMessage = "Err while trying to list folder present in drive";
        state = changeState(state, "errWhileSync");
        return;
      } else {
        folderIdVal = folderId;
        state = changeState(state, "previousExisitingData");
        return;
      }
    } else {
      existingDataSync();
    }
  }

  async function newUpload(dataExists: boolean) {
    const timestamp = new Date().getTime();
    const keyIds = await keys(entriesStore);

    // lastSyncTime in entries are in unix timestamp
    // whereas lastTimeSynced is in data string format, as i didn't really converted it when got back from drive

    try {
      await Promise.all(
        keyIds.map((id) => {
          return update(
            id,
            (val) => {
              return {
                ...val,
                lastSyncTime: timestamp,
              };
            },
            entriesStore
          );
        })
      );
    } catch (err) {
      console.error(err);
      errMessage =
        "Err while resolving all the promises, when updating timestamp for new backup process";
      state = changeState(state, "errWhileSync");
      return;
    }

    const data = await values(entriesStore);

    if (dataExists === true) {
      // delete the folder with it's content
      const result = await deleteIntrospectaFolder(folderIdVal);

      if (result === "err") {
        errMessage = "Err when trying to delete the introspecta folder";
        state = changeState(state, "errWhileSync");
        return;
      }
    }

    const newFolderId = await createIntrospectaFolder();

    if (newFolderId === "errFolderCreate") {
      errMessage = "Wasn't able to create introspecta folder";
      state = changeState(state, "errWhileSync");
      return;
    } else if (newFolderId === "errNoIdResult") {
      errMessage = "Couldn't get folder id, internal problem";
      state = changeState(state, "errWhileSync");
      return;
    }

    const uploadDataResult = await uploadDataToDrive(newFolderId, data);

    if (uploadDataResult === "notAuthorized") {
      await deleteIntrospectaFolder(newFolderId);

      errMessage =
        "Please login so that drive allows me to add data to their storage";
      state = changeState(state, "errWhileSync");
      return;
    } else if (uploadDataResult === "errUpload") {
      await deleteIntrospectaFolder(newFolderId);

      errMessage = "Couldn't upload the data, internal problem";
      state = changeState(state, "errWhileSync");
      return;
    }

    const uploadPubkeyResult = await uploadPubkeyToDrive(
      newFolderId,
      $journalling.pubKey,
      uploadDataResult.id
    );

    if (uploadPubkeyResult === "notAuthorized") {
      await deleteIntrospectaFolder(newFolderId);

      errMessage =
        "Please login so that drive allows me to add data to their storage";
      state = changeState(state, "errWhileSync");
      return;
    } else if (uploadPubkeyResult === "errUpload") {
      await deleteIntrospectaFolder(newFolderId);

      errMessage = "Couldn't upload the data, internal problem";
      state = changeState(state, "errWhileSync");
      return;
    }

    const dataHash = await hashData(pack(data));

    if (dataHash === null) {
      await deleteIntrospectaFolder(newFolderId);

      errMessage = "Err hashing data";
      state = changeState(state, "errWhileSync");
      return;
    }

    localStorage.setItem("fileId", uploadDataResult.id);
    localStorage.setItem("lastSyncTime", uploadDataResult.modifiedTime);
    localStorage.setItem("dataHash", dataHash);

    state = changeState(state, "successSync");
    return;
  }

  async function existingDataSync() {
    const fileId = localStorage.getItem("fileId");

    const dataHash = localStorage.getItem("dataHash");

    const lastSyncTime = localStorage.getItem("lastSyncTime");

    if (dataHash === null || fileId === null || lastSyncTime === null) {
      errMessage =
        "dataHash or fileId or modifiedTime data are not present, when app is doing existing data sync";
      state = changeState(state, "errWhileSync");
      return;
    }
    const unixLastSyncTime = new Date(lastSyncTime).getTime();

    const localData = await values(entriesStore);

    const localHash = await hashData(pack(localData));

    if (localHash === null) {
      errMessage = "Err hashing data";
      state = changeState(state, "errWhileSync");
      return;
    }

    let fileIsModified: boolean = false;

    // first checking if there are updates or not
    const driveModifiedTime = await getModifiedTime(fileId);

    if (driveModifiedTime === "err") {
      errMessage = "Got err while trying to retrieve modified Time of data";
      state = changeState(state, "errWhileSync");
      return;
    } else if (driveModifiedTime === "errResultFieldMissing") {
      errMessage = "modifiedTime field in result is missing, internal problem";
      state = changeState(state, "errWhileSync");
      return;
    }

    if (new Date(driveModifiedTime).getTime() > unixLastSyncTime) {
      fileIsModified = true;
    }

    // this takes care of syncing with changes of drive
    if (fileIsModified === true) {
      let retrieveData = await downloadFile(fileId);

      if (retrieveData === "errDownloadData") {
        errMessage = "Got err while trying to retrieve data";
        state = changeState(state, "errWhileSync");
        return;
      } else if (retrieveData === "errWhileUnpackingBuffer") {
        errMessage =
          "Wasn't able to deserialise the data got from drive, internal problem";
        state = changeState(state, "errWhileSync");
        return;
      } else if (retrieveData === "notAuthorized") {
        errMessage =
          "Please login so that drive allows me to add data to their storage";
        state = changeState(state, "errWhileSync");
        return;
      }

      // then updating the local data
      let oldKeys: string[] = [];

      localData.forEach((data: EncryptedEntries) => {
        if (data.lastSyncTime !== null) {
          oldKeys.push(data.id);
        }
      });

      const driveKeys = retrieveData.map((entry) => {
        return entry.id;
      });

      // this handles deleting all the entry according to drive data state
      let deleteArr = [];

      for (let id of oldKeys) {
        if (!driveKeys.includes(id)) {
          deleteArr.push(id);
        }
      }

      // now adding or updating data from drive data
      let updates: [string, EncryptedEntries][] = [];

      for (let entry of retrieveData) {
        if (entry.lastSyncTime > unixLastSyncTime) {
          updates.push([entry.id, entry]);
        }
      }

      if (updates.length !== 0) {
        // updating each local data
        try {
          await setMany(updates, entriesStore);
        } catch (err) {
          console.error(err);
          errMessage =
            "Err while updating local data, in case of file is modified";
          state = changeState(state, "errWhileSync");
          return;
        }
      }

      if (deleteArr.length !== 0) {
        // now deleting entries
        try {
          await delMany(deleteArr, entriesStore);
        } catch (err) {
          console.error(err);
          errMessage =
            "Err while deleting local data, in case of file is modified";
          state = changeState(state, "errWhileSync");
          return;
        }
      }

      // updating modified time as drive one
      localStorage.setItem("lastSyncTime", driveModifiedTime);
    }

    // after sync done with drive data
    const timestamp = new Date().getTime();

    const changeTimestamp: string[] = [];

    localData.forEach((data: EncryptedEntries) => {
      if (data.lastSyncTime === null) {
        changeTimestamp.push(data.id);
      }
    });

    await Promise.all(
      changeTimestamp.map((id) => {
        return update(
          id,
          (val) => {
            return {
              ...val,
              lastSyncTime: timestamp,
            };
          },
          entriesStore
        );
      })
    );

    const finalData = await values(entriesStore);

    // thus also accounting of case where a entry is deleted
    if (localHash !== dataHash) {
      // uploading to drive
      const updateDataResult = await updateDataOfDrive(fileId, finalData);

      if (updateDataResult === "notAuthorized") {
        await Promise.all(
          changeTimestamp.map((id) => {
            return update(
              id,
              (val) => {
                return {
                  ...val,
                  lastSyncTime: null,
                };
              },
              entriesStore
            );
          })
        );

        errMessage =
          "Please login so that drive allows me to add data to their storage";
        state = changeState(state, "errWhileSync");
        return;
      } else if (updateDataResult === "errUpload") {
        await Promise.all(
          changeTimestamp.map((id) => {
            return update(
              id,
              (val) => {
                return {
                  ...val,
                  lastSyncTime: null,
                };
              },
              entriesStore
            );
          })
        );

        errMessage = "Couldn't upload the data, internal problem";
        state = changeState(state, "errWhileSync");
        return;
      }

      // setting back stuff
      localStorage.setItem("lastSyncTime", updateDataResult.modifiedTime);
    }

    const finalDataHash = await hashData(pack(finalData));

    // I don't have to make this atomic, as if this fails it doesn't matter
    // because if user again sync's, it will not do above stuff and do this instead
    // thus again can do finalDataHash
    // But yeah, user won't be shown reload button and that can be a problem if user
    // continues to use app after sync
    if (finalDataHash === null) {
      errMessage = "Err hashing data";
      state = changeState(state, "errWhileSync");
      return;
    }
    localStorage.setItem("dataHash", finalDataHash);

    if (fileIsModified === true) {
      state = changeState(state, "successSyncWithUpdate");
    } else {
      state = changeState(state, "successSync");
    }

    return;
  }

  let syncModal: HTMLDialogElement;

  $: if (syncModal && syncModalShow) {
    let accessTokenObj = gapi.auth.getToken();
    if (accessTokenObj === null) {
      state = "login";
    } else {
      state = "syncPrompt";
    }

    syncModal.showModal();
  }
</script>

<dialog
  class="modal"
  bind:this={syncModal}
  on:close={() => (syncModalShow = false)}
>
  <div class="modal-box flex flex-col items-center gap-2">
    {#if state === "login"}
      <div class="flex justify-end w-full">
        <button on:click={() => syncModal.close()} class="btn-ghost btn btn-xs"
          >close</button
        >
      </div>
      <p class="font-semibold bg-base-200 rounded-md p-4">
        Sry, I know i am being annoying here. But before syncing, please go to
        settings backup section where i have explained how sync works. Don't
        worry it won't involved any technical details. It's just answer question
        like why do you have to login again and again and when you should sync
        ideally
      </p>
      <button on:click={getAccessToken} class="btn-secondary btn btn-wide"
        >Google Login</button
      >
    {/if}
    {#if state === "syncPrompt"}
      <div class="flex justify-end w-full">
        <button on:click={() => syncModal.close()} class="btn-ghost btn btn-xs"
          >close</button
        >
      </div>
      <p class="font-semibold bg-base-200 rounded-md p-4">
        Sry, I know i am being annoying here. But before syncing, please go to
        settings backup section where i have explained how sync works. Don't
        worry it won't involved any technical details. It's just answer question
        like why do you have to login again and again and when you should sync
        ideally
      </p>
      <div class="flex justify-evenly w-full">
        <button
          on:click={() => {
            revokeAccessToken();
            state = changeState(state, "changeAccount");
            return;
          }}
          class="btn-info btn">Change Account</button
        >

        <button on:click={syncTime} class="btn-secondary btn">Sync Now</button>
      </div>
    {/if}
    {#if state === "syncing"}
      <div class="flex flex-col justify-center items-center">
        <div class="loader" />
        <strong class="mt-6">
          Cool, just a sec, let me sync stuff in background
        </strong>
      </div>
    {/if}
    {#if state === "errShow"}
      <div class="flex justify-end w-full">
        <button on:click={() => syncModal.close()} class="btn-ghost btn btn-xs"
          >close</button
        >
      </div>
      <div class="flex flex-col justify-center items-center">
        <strong class="mb-3">
          Err while syncing... Don't Worry just copy the err message and mail me
          on roopkumards@gmail.com, i would be glad to help you
        </strong>
        <p>Err message: {errMessage}</p>
      </div>
    {/if}
    {#if state === "doneSyncWithUpdate"}
      <div class="flex justify-end w-full">
        <button on:click={() => syncModal.close()} class="btn-ghost btn btn-xs"
          >close</button
        >
      </div>
      <div class="flex flex-col justify-center items-center">
        <strong> Done Syncing :) </strong>
        <p>
          I found some changes while syncing, please relogin with button below
          to affect the changes
        </p>
        <button
          on:click={() => {
            $stage = "Login";
            return;
          }}
          class="btn-secondary btn"
        >
          Relogin
        </button>
      </div>
    {/if}
    {#if state === "doneSync"}
      <div class="flex justify-end w-full">
        <button on:click={() => syncModal.close()} class="btn-ghost btn btn-xs"
          >close</button
        >
      </div>
      <div class="flex flex-col justify-center items-center">
        <strong> Done Syncing :) </strong>
      </div>
    {/if}
    {#if state === "deleteExistingData"}
      <div class="flex justify-end w-full">
        <button on:click={() => syncModal.close()} class="btn-ghost btn btn-xs"
          >close</button
        >
      </div>
      <p class="bg-base-200 font-semibold p-4 rounded-md">
        I found that the account you choose already has some existing data
        related to this app. Are you sure, you want to overwrite all the data
      </p>
      <div class="flex justify-evenly w-full">
        <button
          on:click={() => {
            revokeAccessToken();
            state = changeState(state, "changeAccount");
            return;
          }}
          class="btn-secondary btn"
        >
          Change Account
        </button>
        <button
          on:click={() => {
            state = changeState(state, "yesDeleteThem");
            newUpload(true);
            return;
          }}
          class="btn-warning btn"
        >
          Yes Delete them!
        </button>
      </div>
    {/if}
  </div>
</dialog>

<style lang="postcss">
  .loader {
    border: 1rem solid hsl(var(--n));
    border-top: 1rem solid hsl(var(--nc));
    border-radius: 50%;
    width: 8rem;
    height: 8rem;
    animation: spin 2s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
