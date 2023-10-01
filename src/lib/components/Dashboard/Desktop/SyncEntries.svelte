<script lang="ts">
  import {
    createStore,
    keys,
    setMany,
    update,
    values,
    delMany,
  } from "idb-keyval";
  import { pack, unpack } from "msgpackr";
  import { journalling, sync } from "$lib/store";

  export let syncModalShow: boolean;

  interface States {
    [stateName: string]: {
      [actionName: string]:
        | "login"
        | "syncPrompt"
        | "syncing"
        | "deleteExistingData"
        | "doneSync"
        | "errShow";
    };
  }

  const states: States = {
    login: {
      gotAccessToken: "syncPrompt",
    },
    syncPrompt: {
      clickedSync: "syncing",
      changeAccount: "login",
    },
    syncing: {
      successSync: "doneSync",
      errWhileSync: "errShow",
      previousExisitingData: "deleteExistingData",
    },
    deleteExistingData: {
      yesDeleteThem: "syncing",
      changeAccount: "login",
    },
    doneSync: {}, // only close button exists in this state
    errShow: {}, // only close button exists in this state
  };

  type State =
    | "login"
    | "syncPrompt"
    | "syncing"
    | "deleteExistingData"
    | "doneSync"
    | "errShow";

  let state: State = "login";

  // to show err message in errShow state
  let errMessage = "";

  // to ask user to refresh if changes introduce while syncing
  let updateToLocalData = false;

  // folderId for new upload if existing data is there
  let folderIdVal = "";

  function changeState(currentState: string, action: string) {
    return states[currentState][action];
  }

  let clientInit: any;

  async function getAccessToken() {
    clientInit = window.google.accounts.oauth2.initTokenClient({
      client_id:
        "957316931-j7al5upb33rnqvmb5sapvp7771h4h9bo.apps.googleusercontent.com",
      scope: "https://www.googleapis.com/auth/drive.file",
      callback: (res: {
        access_token: string;
        expires_in: number;
        scope: string;
        token_type: string;
      }) => {
        $sync.accessToken = res.access_token;

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
      localStorage.getItem("newArr") === null ||
      localStorage.getItem("updateArr") === null
    ) {
      // first checking if existing data is present on drive or not
      try {
        const response = await fetch("/api/existingData", {
          method: "POST",
          body: JSON.stringify({ accessToken: $sync.accessToken }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        const { dataExists, folderId } = await response.json();
        if (dataExists === true) {
          folderIdVal = folderId;
          state = changeState(state, "deleteExistingData");
          return;
        } else if (dataExists === false) {
          folderIdVal = "";
          newUpload(false);
        }
      } catch (err) {
        errMessage = "Err while checking if there is any previous data or not";
        state = changeState(state, "errWhileSync");
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

    const promises = keyIds.map(async (id) => {
      await update(
        id,
        (val) => {
          return {
            ...val,
            lastSyncTime: timestamp,
          };
        },
        entriesStore
      );
    });

    try {
      await Promise.all(promises);
    } catch (err) {
      console.error(err);
      errMessage =
        "Err while resolving all the promises, when updating timestamp for new backup process";
      state = changeState(state, "errWhileSync");
      return;
    }

    const data = await values(entriesStore);

    const encodedVersion = pack({
      data: data,
      accessToken: $sync.accessToken,
      pubKey: $journalling.pubKey,
      dataExists: dataExists,
      folderId: folderIdVal,
    });

    try {
      const response = await fetch("/api/uploadData", {
        method: "POST",
        body: encodedVersion,
        headers: {
          "Content-Type": "application/msgpack",
        },
      });

      const { fileId, modifiedTime } = await response.json();
      localStorage.setItem("fileId", fileId);
      localStorage.setItem("lastSyncTime", modifiedTime);
      localStorage.setItem("newArr", JSON.stringify([]));
      localStorage.setItem("updateArr", JSON.stringify([]));

      state = changeState(state, "successSync");
      return;
    } catch (err) {
      console.error(err);
      errMessage = "Err while checking if there is any previous data or not";
      state = changeState(state, "errWhileSync");
      return;
    }
  }

  async function existingDataSync() {
    const newArrString = localStorage.getItem("newArr");

    const updateArrString = localStorage.getItem("updateArr");

    const fileId = localStorage.getItem("fileId");

    const lastSyncTime = localStorage.getItem("lastSyncTime");

    if (
      newArrString === null ||
      updateArrString === null ||
      fileId === null ||
      lastSyncTime === null
    ) {
      errMessage =
        "changes or deletes or fileId or modifiedTime data are not present, when app is doing existing data sync";
      state = changeState(state, "errWhileSync");
      return;
    }
    let newArr: string[] = JSON.parse(newArrString);
    let updateArr: string[] = JSON.parse(updateArrString);
    const unixLastSyncTime = new Date(lastSyncTime).getTime();

    interface RetrieveData {
      id: string;
      entry: Uint8Array;
      lastSyncTime: number;
    }

    let retrieveData: RetrieveData[] = [];
    let fileIsModified: boolean;

    // first checking if there are updates or not
    try {
      const response = await fetch("/api/retrieveData", {
        method: "POST",
        body: JSON.stringify({
          accessToken: $sync.accessToken,
          fileId: fileId,
          lastSyncTime: lastSyncTime,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.arrayBuffer();
      const deserialisedData: {
        data: RetrieveData[];
        fileIsModified: boolean;
      } = unpack(new Uint8Array(data));

      retrieveData = deserialisedData.data;
      fileIsModified = deserialisedData.fileIsModified;
    } catch (err) {
      console.error(err);
      errMessage = "Err while trying to retrieve data for existing data sync";
      state = changeState(state, "errWhileSync");
      return;
    }

    // this takes care of syncing with changes of drive
    if (fileIsModified === true) {
      // then updating the local data
      const oldKeys: string[] = getOldKeys(await keys(entriesStore), newArr);
      const driveKeys = retrieveData.map((entry) => {
        return entry.id;
      });

      // this handles deleting all the entry according to drive data state
      let deleteArr = [];

      for (let id of oldKeys) {
        if (!driveKeys.includes(id)) {
          const updateArrIndex = updateArr.indexOf(id);
          if (updateArrIndex !== -1) {
            updateArr.splice(updateArrIndex, 1);
          }

          deleteArr.push(id);
        }
      }

      // now adding or updating data from drive data
      let updates: [string, RetrieveData][] = [];

      for (let entry of retrieveData) {
        if (entry.lastSyncTime > unixLastSyncTime) {
          const updateArrIndex = updateArr.indexOf(entry.id);
          if (updateArrIndex !== -1) {
            updateArr.splice(updateArrIndex, 1);
          }
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
          await delMany(deleteArr);
        } catch (err) {
          console.error(err);
          errMessage =
            "Err while deleting local data, in case of file is modified";
          state = changeState(state, "errWhileSync");
          return;
        }
      }
    }

    // after sync done with drive data
    const timestamp = new Date().getTime();

    await Promise.all(
      newArr.map((id) => {
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

    await Promise.all(
      updateArr.map((id) => {
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

    // lastly sending it server to save
    const finalData = await values(entriesStore);
    console.log(finalData);
  }

  function getOldKeys(allKeys: string[], newKeys: string[]) {
    let arr = [];

    for (let id of allKeys) {
      if (!newKeys.includes(id)) {
        arr.push(id);
      }
    }

    return arr;
  }

  let syncModal: HTMLDialogElement;

  $: if (syncModal && syncModalShow) {
    if ($sync.accessToken === "") {
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
            $sync.accessToken = "";
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
    {#if state === "doneSync"}
      <div class="flex justify-end w-full">
        <button on:click={() => syncModal.close()} class="btn-ghost btn btn-xs"
          >close</button
        >
      </div>
      <div class="flex flex-col justify-center items-center">
        <strong> Done Syncing :) </strong>
        {#if updateToLocalData === false}
          <p>
            I found some changes while syncing, refresh the page to see the
            effects
          </p>
        {/if}
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
            $sync.accessToken = "";
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
