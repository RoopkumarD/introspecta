<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import decrypt from "$lib/decrypt?worker";
  import Input from "./Input.svelte";
  import { wrap } from "comlink";
  import toast, { Toaster } from "svelte-french-toast";
  import { stage, journalling } from "$lib/store";
  import { createStore, values, setMany, clear } from "idb-keyval";
  import { pack } from "msgpackr";
  import { hashData } from "$lib/utils";
  import {
    SCOPES,
    CLIENT_ID,
    downloadPubKeyFile,
    downloadFile,
    getModifiedTime,
  } from "$lib/googleDrive";

  export let createKey: boolean;

  interface EncryptedEntries {
    id: string;
    entry: Uint8Array;
    lastSyncTime: number;
  }

  interface entry {
    id: string;
    log: {
      title: string;
      content: string;
      timestamp: number;
      journal: string;
    };
  }

  interface DecryptedEntries {
    [journalName: string]: entry[];
  }

  interface WorkerApi {
    decrypt: (
      passphrase: string,
      encryptedEntries: EncryptedEntries[]
    ) => Promise<{ decryptedEntries: DecryptedEntries }>;

    generateKeyPairs: (passphrase: string) => Promise<{ publicKey: string }>;
  }

  let worker: Worker | undefined;
  let workerApi: WorkerApi;

  // need to implement fsm for this, as user can just press unlock diary multiple times
  async function unlockDiary() {
    const entriesStore = createStore("introspecta", "entries");
    if (passphraseEmpty()) {
      toast.error("Bro give me full pass");
      return;
    }

    // checking if passphrase is correct or not
    const genPubKey = await workerApi.generateKeyPairs(passphrase.join(""));
    if (genPubKey.publicKey !== pubKey) {
      toast.error("Password isn't matching with saved one");
      return;
    }

    let encryptedEntries: EncryptedEntries[] = [];

    if (state === "remotePubKey") {
      await toast.promise(
        new Promise(async (resolve, reject) => {
          let data = await downloadFile(dataFileId);

          if (data === "errDownloadData") {
            reject("Err when downloading data from drive");
            return;
          } else if (data === "errWhileUnpackingBuffer") {
            reject("Err when deserialising the data retrieved from drive");
            return;
          } else if (data === "notAuthorized") {
            errMessage =
              "Please login so that drive allows me to add data to their storage";
            modalState = changeModalState(state, "errWhileSync");
            return;
          }

          const dataHash = await hashData(pack(data));

          if (dataHash === null) {
            reject("dataHash is null");
            return;
          }

          if (pubKey === null) {
            reject("pubKey is null");
            return;
          }

          encryptedEntries = data;

          const modifiedTime = await getModifiedTime(dataFileId);

          if (modifiedTime === "err") {
            reject("Err while retrieving modifiedTime of data");
            return;
          } else if (
            modifiedTime === "errResultFieldMissing" ||
            modifiedTime === undefined
          ) {
            reject(
              "Internal error -> result field missing in modifiedTime response"
            );
            return;
          }

          localStorage.setItem("lastSyncTime", modifiedTime);
          localStorage.setItem("fileId", dataFileId);
          localStorage.setItem("dataHash", dataHash);
          localStorage.setItem("pubKey", pubKey);

          let idbData: [string, EncryptedEntries][] = data.map((data) => {
            return [data.id, data];
          });

          await clear(entriesStore);
          setMany(idbData, entriesStore);

          resolve("");
        }),
        {
          loading: "Wait retrieving data from your drive",
          success: "Got the data successfully, now decrypting",
          error: (err) => {
            return err;
          },
        }
      );
    } else if (state === "localPubKey") {
      encryptedEntries = await values(entriesStore);
    }

    const { decryptedEntries } = await workerApi.decrypt(
      passphrase.join(""),
      encryptedEntries
    );

    // now initialising the workspace
    const arrObject = Object.entries(decryptedEntries);

    if (arrObject.length !== 0) {
      $journalling.currentJournal = arrObject[0][0];
      $journalling.journals = Object.keys(decryptedEntries);
      $journalling.entries = decryptedEntries;
    } else {
      $journalling.currentJournal = "default";
      $journalling.journals = ["default"];
      $journalling.entries = { default: [] };
    }

    $journalling.pubKey = pubKey;
    $stage = "Dashboard";
  }

  function passphraseEmpty() {
    for (let i = 0; i < 5; i++) {
      if (passphrase[i].length === 0) {
        return true;
      }
    }

    return false;
  }

  let passphrase: string[] = Array(5).fill(""); // let's not use this, and use form action
  // this way i don't have to have a record of this data and can use the data pass through
  // form

  let noPubKeyDialog: HTMLDialogElement;

  let pubKey: string | null;

  let state: "localPubKey" | "remotePubKey" = "localPubKey";

  interface ModalStates {
    [modalState: string]: {
      [action: string]: ModalState;
    };
  }

  const modalStates: ModalStates = {
    getAccessToken: {
      gotAccessToken: "retrievingPubKey",
      errWhileAccessingToken: "errShow",
    },
    retrievingPubKey: {
      gotPubKey: "chooseAnotherAccount",
      errRetrieving: "errShow",
    },
    errShow: {},
    chooseAnotherAccount: {
      yesChooseAnother: "getAccessToken",
    },
  };

  let errMessage = ""; // need to learn how in fsm, i can show this side effect
  let dataFileId = "";

  type ModalState =
    | "getAccessToken"
    | "retrievingPubKey"
    | "chooseAnotherAccount"
    | "errShow";

  let modalState: ModalState = "getAccessToken";

  function changeModalState(currentState: string, action: string) {
    return modalStates[currentState][action];
  }

  async function getAccessToken() {
    let clientInit = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (res) => {
        if (res.error) {
          errMessage = "Err while authorizing, to get access token";
          console.error(res.error);
          modalState = changeModalState(modalState, "errWhileAccessingToken");
          return;
        }

        // $sync.accessToken = res.access_token;
        modalState = changeModalState(modalState, "gotAccessToken");
        retrievePubKey();
      },
    });

    clientInit.requestAccessToken();
  }

  async function retrievePubKey() {
    const pubKeyDrive = await downloadPubKeyFile();

    if (pubKeyDrive === null) {
      errMessage = "pubKey file doesn't exists";
      modalState = changeModalState(modalState, "errRetrieving");
      return;
    } else if (pubKeyDrive === "errListFolder") {
      errMessage = "Err while finding introspecta folder";
      modalState = changeModalState(modalState, "errRetrieving");
      return;
    } else if (pubKeyDrive === "errListPubKey") {
      errMessage = "Err while finding pubkey file";
      modalState = changeModalState(modalState, "errRetrieving");
      return;
    } else if (pubKeyDrive === "errDownloadPubkey") {
      errMessage = "Err while downloading pubkey file";
      modalState = changeModalState(modalState, "errRetrieving");
      return;
    }

    pubKey = pubKeyDrive.pubKey;
    dataFileId = pubKeyDrive.dataFileId;

    modalState = changeModalState(modalState, "gotPubKey");

    return;
  }

  onMount(() => {
    pubKey = localStorage.getItem("pubKey");
    if (pubKey === null) {
      state = "remotePubKey";
    }

    worker = new decrypt();
    workerApi = wrap<WorkerApi>(worker);
  });

  onDestroy(() => {
    worker?.terminate();
  });
</script>

<Toaster />

<dialog class="modal" bind:this={noPubKeyDialog}>
  <div class="modal-box w-max flex flex-col items-center">
    <p class="font-medium">
      There is no public key saved in this browser. If you have a account and
      have synced with your google drive
    </p>
    <p class="font-medium">
      Then click below and choose the account, so that i can retrieve those
      saved keys
    </p>
    {#if modalState === "retrievingPubKey"}
      <p>Retrieving the public key from drive ....</p>
    {/if}
    {#if modalState === "getAccessToken"}
      <button on:click={getAccessToken} class="btn-primary btn btn-sm btn-wide"
        >Choose Drive Account</button
      >
    {/if}
    {#if modalState === "chooseAnotherAccount"}
      <button
        on:click={() => {
          pubKey = null;
          modalState = changeModalState(modalState, "yesChooseAnother");
        }}
        class="btn-primary btn btn-sm btn-wide">Change Drive Account</button
      >
      <p>
        Got the pubkey, now you can try to login with the passphrase. But if you
        choosed the wrong account don't worry just change it through above
        button
      </p>
    {/if}
    {#if modalState === "errShow"}
      <p class="mt-4">
        There was a problem, please refer me the below error message at
        roopkumards@gmail.com
      </p>
      <p>{errMessage}</p>
    {/if}
    <div class="divider">OR</div>
    <p class="font-medium">
      If you want to create new account, then click on create a account option
      below the login
    </p>
    <button
      on:click={() => noPubKeyDialog.close()}
      class="btn-secondary btn btn-sm btn-wide">close</button
    >
  </div>
</dialog>

<div class="absolute bottom-10 right-10 font-bold bg-accent p-2 rounded-md">
  <p class=""><span class="underline">Pro tip: </span> Use tab to</p>
  <p>switch to next input box</p>
</div>

<main
  class="font-inter flex flex-col items-center mt-20
  "
>
  <h1 class="font-bold mb-8 text-3xl lg:text-5xl">Unlock Journal</h1>
  <div
    class="mb-8 flex flex-wrap items-center justify-center w-full lg:w-1/2 gap-4"
  >
    {#each Array(5) as _, i}
      <Input disabled={false} bind:value={passphrase[i]} index={i + 1} />
    {/each}
  </div>
  <div class="flex flex-col items-center">
    {#if state === "remotePubKey"}
      <button
        on:click={() => noPubKeyDialog.showModal()}
        class="btn btn-neutral btn-wide mb-2"
        >you can't open journals, click to know</button
      >
    {/if}
    {#if pubKey !== null}
      <button on:click={unlockDiary} class="btn btn-primary btn-wide text-xl"
        >unlock</button
      >
    {/if}
    <div class="divider">OR</div>
    <button
      on:click={() => (createKey = true)}
      class="btn btn-link lowercase text-secondary text-xl"
      >create a account</button
    >
  </div>
</main>
