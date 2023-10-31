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
  import {
    deserialiseDriveData,
    hashData,
    serialiseDataForDrive,
  } from "$lib/utils";
  import { pack } from "msgpackr";
  import { publicKeyStore, stage } from "$lib/store";
  import {
    revokeAccessToken,
    getModifiedTime,
    downloadFile,
    uploadDataToDrive,
    updateDataOfDrive,
    getFileMetadata,
    deleteIntrospectaFile,
  } from "$lib/googleDrive";
  import { CLIENT_ID } from "$lib/googleDrive";
  import GoogleButton from "$lib/components/GoogleButton.svelte";
  import { goto } from "$app/navigation";
  import type { serialisedEntries } from "$lib/types";

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

  // number of entries to show to user and fileId if user wants to delete
  let entries = "";
  let existingFileId = "";

  function changeState(currentState: string, action: string) {
    return states[currentState][action];
  }

  let clientInit: any;

  async function getAccessToken() {
    if (window.google === undefined) {
      errMessage = "Google GSI is not loaded properly, internal problem";
      state = changeState(state, "err");
      return;
    }

    clientInit = window.google.accounts.oauth2.initTokenClient({
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
            state = changeState(state, "errWhileSync");
            return;
          } else if (err.message === "responseFieldsUndefined") {
            errMessage =
              "Response from google drive didn't include important data, internal problem";
            state = changeState(state, "errWhileSync");
            return;
          } else if (err.message === "entriesNotStored") {
            errMessage =
              "File data is modified by someone, please reach out to me";
            state = changeState(state, "errWhileSync");
            return;
          } else if (err.message === "pubKeyNotStored") {
            errMessage =
              "File data doesn't contain pubKey, please reach out to me";
            state = changeState(state, "errWhileSync");
            return;
          }
        } else {
          errMessage = "error catch is not Error object, internal problem";
          state = changeState(state, "errWhileSync");
          return;
        }
      }

      if (metaDatas === null) {
        newUpload(false);
        return;
      } else {
        entries = metaDatas.entries;
        existingFileId = metaDatas.id;
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
      const result = await deleteIntrospectaFile(existingFileId);

      if (result === "err") {
        errMessage = "Err when trying to delete the introspecta folder";
        state = changeState(state, "errWhileSync");
        return;
      }
    }

    const serialisedData = serialiseDataForDrive(data);

    let uploadDataResult: { id: string; modifiedTime: string } = {
      id: "",
      modifiedTime: "",
    };
    try {
      uploadDataResult = await uploadDataToDrive(
        $publicKeyStore,
        serialisedData
      );
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === "notAuthorized") {
          errMessage =
            "Please login so that drive allows me to add data to their storage";
          state = changeState(state, "errWhileSync");
          return;
        } else if (err.message === "errUpload") {
          errMessage = "Couldn't upload the data, internal problem";
          state = changeState(state, "errWhileSync");
          return;
        }
      } else {
        errMessage = "error catch is not Error object, internal problem";
        state = changeState(state, "errWhileSync");
        return;
      }
    }

    const dataHash = await hashData(pack(data));

    if (dataHash === null) {
      await deleteIntrospectaFile(uploadDataResult.id);

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
    let driveModifiedTime: string = "";
    try {
      driveModifiedTime = await getModifiedTime(fileId);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === "err") {
          errMessage = "Got err while trying to retrieve modified Time of data";
          state = changeState(state, "errWhileSync");
          return;
        } else if (err.message === "errResultFieldMissing") {
          errMessage =
            "modifiedTime field in result is missing, internal problem";
          state = changeState(state, "errWhileSync");
          return;
        }
      } else {
        errMessage = "error catch is not Error object, internal problem";
        state = changeState(state, "errWhileSync");
        return;
      }
    }

    const regexString = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

    if (!regexString.test(driveModifiedTime)) {
      errMessage =
        "modifiedTime from drive is not in expected format, internal problem";
      state = changeState(state, "errWhileSync");
      return;
    }

    if (new Date(driveModifiedTime).getTime() > unixLastSyncTime) {
      fileIsModified = true;
    }

    // this takes care of syncing with changes of drive
    if (fileIsModified === true) {
      let retrieveData: serialisedEntries[] = [];
      try {
        retrieveData = await downloadFile(fileId);
      } catch (err) {
        if (err instanceof Error) {
          if (err.message === "errDownloadData") {
            errMessage = "Got err while trying to retrieve data";
            state = changeState(state, "errWhileSync");
            return;
          } else if (err.message === "errWhileUnpackingBuffer") {
            errMessage =
              "Wasn't able to deserialise the data got from drive, internal problem";
            state = changeState(state, "errWhileSync");
            return;
          } else if (err.message === "notAuthorized") {
            errMessage =
              "Please login so that drive allows me to add data to their storage";
            state = changeState(state, "errWhileSync");
            return;
          }
        } else {
          errMessage = "error catch is not Error object, internal problem";
          state = changeState(state, "errWhileSync");
          return;
        }
      }

      let deserialised = deserialiseDriveData(retrieveData);

      // then updating the local data
      let oldKeys: string[] = [];

      localData.forEach((data: EncryptedEntries) => {
        if (data.lastSyncTime !== null) {
          oldKeys.push(data.id);
        }
      });

      const driveKeys = deserialised.map((entry) => {
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

      for (let entry of deserialised) {
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

    /*
    Err handling and atomicity

    Well since if there is some data in drive, then i don't have to worry about retrieveData again
    if there is error below because, localModifiedTime is updated. Thus it won't call again
    And only execute stuff below again

    Just one problem, can't say file is modified to user, maybe i should find if there is 
    change by looking at individual entries sync time
    */

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
      const serialised = serialiseDataForDrive(finalData);

      let updateDataResult: { modifiedTime: string } = { modifiedTime: "" };
      try {
        updateDataResult = await updateDataOfDrive(fileId, serialised);
      } catch (err) {
        if (err instanceof Error) {
          if (err.message === "notAuthorized" || err.message === "errUpload") {
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

            if (err.message === "notAuthorized") {
              errMessage =
                "Please login so that drive allows me to add data to their storage";
              state = changeState(state, "errWhileSync");
            } else if (err.message === "errUpload") {
              errMessage = "Couldn't upload the data, internal problem";
              state = changeState(state, "errWhileSync");
            }

            return;
          }
        } else {
          errMessage = "error catch is not Error object, internal problem";
          state = changeState(state, "errWhileSync");
          return;
        }
      }

      // setting back stuff
      localStorage.setItem("lastSyncTime", updateDataResult.modifiedTime);
    }

    const finalDataHash = await hashData(pack(finalData));

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
        Hey, before syncing, I would recommend that you go to the settings and
        read the FAQs under the backup section. There, I've answered questions
        like why you need to log in repeatedly and a few more. Don't worry; it
        won't take much of your time :)
      </p>
      <p class="font-medium">Choose Google Drive Account:</p>
      <GoogleButton {getAccessToken} />
      <a
        href="https://github.com/RoopkumarD/introspecta/blob/main/user-data.md"
        target="_blank"
        class="link mt-2 text-center">How data is handled by this app</a
      >
    {/if}
    {#if state === "syncPrompt"}
      <div class="flex justify-end w-full">
        <button on:click={() => syncModal.close()} class="btn-ghost btn btn-xs"
          >close</button
        >
      </div>
      <p class="font-medium bg-base-200 rounded-md p-4">
        Great, you can now sync and store data in your account's drive storage.
        If you've selected the wrong account, don't worry – you can change it by
        clicking the <span class="font-bold">Change Google Drive Account</span>
        button. Otherwise, you can proceed with
        <span class="font-bold">Sync and Backup to Google Drive</span>.
      </p>
      <div class="flex flex-col">
        <button on:click={syncTime} class="btn normal-case"
          ><img src="/driveLogo.png" alt="drive-logo" class="h-5 w-5" />Sync and
          Backup to Google Drive</button
        >
        <div class="divider">OR</div>
        <button
          on:click={() => {
            revokeAccessToken();
            state = changeState(state, "changeAccount");
            return;
          }}
          class="btn-info btn">Change Google Drive Account</button
        >
      </div>
    {/if}
    {#if state === "syncing"}
      <div class="flex flex-col justify-center items-center">
        <p>Loading...</p>
        <strong class="mt-1">
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
            goto("/unlock-diary");
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
        I found {entries} entries in this google account drive. Are you sure, you
        want to overwrite all the data
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
