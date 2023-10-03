<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import decrypt from "$lib/decrypt?worker";
  import Input from "./Input.svelte";
  import { wrap } from "comlink";
  import toast, { Toaster } from "svelte-french-toast";
  import { stage, journalling, sync } from "$lib/store";
  import { createStore, values, setMany, clear } from "idb-keyval";
  import { unpack } from "msgpackr";

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
          let data;

          try {
            const res = await fetch("api/loginRetrieveData", {
              method: "POST",
              body: JSON.stringify({
                accessToken: $sync.accessToken,
                parentFolderId: parentFolderId,
              }),
            });
            data = await res.arrayBuffer();
          } catch (err) {
            console.error(err);
            reject("");
          }

          const deserialisedData: {
            data: EncryptedEntries[];
            fileId: string;
            modifiedTime: string;
          } = unpack(new Uint8Array(data)); // todo - learn how devs do try catch

          encryptedEntries = deserialisedData.data;
          localStorage.setItem("lastSyncTime", deserialisedData.modifiedTime);
          localStorage.setItem("fileId", deserialisedData.fileId);
          localStorage.setItem("newArr", JSON.stringify([]));
          localStorage.setItem("updateArr", JSON.stringify([]));
          localStorage.setItem("pubKey", pubKey);

          let idbData: [string, EncryptedEntries][] = deserialisedData.data.map(
            (data) => {
              return [data.id, data];
            }
          );

          await clear(entriesStore);
          setMany(idbData, entriesStore);

          resolve("");
        }),
        {
          loading: "Wait retrieving data from your drive",
          success: "Got the data successfully, now decrypting",
          error: "Err while retrieving data :|, pls contact me",
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
  let parentFolderId = "";

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
        modalState = changeModalState(modalState, "gotAccessToken");
        retrievePubKey();
      },
    });

    clientInit.requestAccessToken();
  }

  async function retrievePubKey() {
    try {
      const response = await fetch("/api/retrievePubkey", {
        method: "POST",
        body: JSON.stringify({ accessToken: $sync.accessToken }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const val = await response.json();

      if (val.foundPubkey === false) {
        errMessage = "There is no public key in the drive";
        modalState = changeModalState(modalState, "errRetrieving");
        return;
      }

      pubKey = val.pubKey;
      if (pubKey === null) {
        errMessage = "retrieve pubkey is null, but it wasn't supposed to";
        modalState = changeModalState(modalState, "errRetrieving");
        return;
      }

      parentFolderId = val.parentFolderId;

      modalState = changeModalState(modalState, "gotPubKey");
    } catch (err) {
      console.error(err);
      errMessage = "Err while retrieving public key from drive";
      modalState = changeModalState(modalState, "errRetrieving");
      return;
    }
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
