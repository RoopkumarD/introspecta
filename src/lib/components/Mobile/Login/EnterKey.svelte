<script lang="ts">
  import { onMount } from "svelte";
  import Input from "./Input.svelte";
  import GoogleButton from "$lib/components/GoogleButton.svelte";
  import toast, { Toaster } from "svelte-french-toast";
  import { stage, journalling } from "$lib/store";
  import { createStore, values, setMany, clear, keys } from "idb-keyval";
  import { pack } from "msgpackr";
  import { deserialiseDriveData, hashData } from "$lib/utils";
  import {
    SCOPES,
    CLIENT_ID,
    downloadFile,
    getFileMetadata,
    revokeAccessToken,
  } from "$lib/googleDrive";
  import { generateKeyPairs, decrypt } from "$lib/libsodium";
  import { goto } from "$app/navigation";

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

  // need to implement fsm for this, as user can just press unlock diary multiple times
  async function unlockDiary() {
    const entriesStore = createStore("introspecta", "entries");
    if (passphraseEmpty()) {
      toast.error("Bro give me full pass");
      return;
    }

    // checking if passphrase is correct or not
    const genPubKey = await generateKeyPairs(passphrase.join(""));
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

          const deserialised = deserialiseDriveData(data);
          encryptedEntries = deserialised;

          localStorage.setItem("lastSyncTime", modifiedTime);
          localStorage.setItem("fileId", dataFileId);
          localStorage.setItem("dataHash", dataHash);
          localStorage.setItem("pubKey", pubKey);

          let idbData: [string, EncryptedEntries][] = deserialised.map(
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
          error: (err) => {
            return err;
          },
        }
      );
    } else if (state === "localPubKey") {
      encryptedEntries = await values(entriesStore);
    }

    const { decryptedEntries } = await decrypt(
      passphrase.join(""),
      encryptedEntries
    );

    // now initialising the workspace
    const arrObject = Object.entries(decryptedEntries);

    if (arrObject.length !== 0) {
      const ids: string[] = await keys(entriesStore);

      $journalling.usedIds = new Set(ids);
      $journalling.currentJournal = arrObject[0][0];
      $journalling.journals = Object.keys(decryptedEntries);
      $journalling.entries = decryptedEntries;
    } else {
      $journalling.usedIds = new Set();
      $journalling.currentJournal = "default";
      $journalling.journals = ["default"];
      $journalling.entries = { default: [] };
    }

    $journalling.pubKey = pubKey;
    $stage = "Dashboard";

    goto("/mobile/app");
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
  let modifiedTime = "";

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

        modalState = changeModalState(modalState, "gotAccessToken");
        retrievePubKey();
      },
    });

    clientInit.requestAccessToken();
  }

  async function retrievePubKey() {
    const metaDatas = await getFileMetadata();

    if (metaDatas === null) {
      errMessage = "introspecta file doesn't exists";
      modalState = changeModalState(modalState, "errRetrieving");
      return;
    } else if (metaDatas === "errListFile") {
      errMessage = "Err while finding introspecta file";
      modalState = changeModalState(modalState, "errRetrieving");
      return;
    } else if (metaDatas === "responseFieldsUndefined") {
      errMessage =
        "Response from google drive didn't include important data, internal problem";
      modalState = changeModalState(modalState, "errRetrieving");
      return;
    } else if (metaDatas === "entriesNotStored") {
      errMessage = "File data is modified by someone, please reach out to me";
      modalState = changeModalState(modalState, "errRetrieving");
      return;
    } else if (metaDatas === "pubKeyNotStored") {
      errMessage = "File data doesn't contain pubKey, please reach out to me";
      modalState = changeModalState(modalState, "errRetrieving");
      return;
    }

    pubKey = metaDatas.pubKey;
    dataFileId = metaDatas.id;
    modifiedTime = metaDatas.modifiedTime;

    modalState = changeModalState(modalState, "gotPubKey");

    return;
  }

  onMount(() => {
    pubKey = localStorage.getItem("pubKey");
    if (pubKey === null) {
      state = "remotePubKey";
    }
  });
</script>

<Toaster />

<dialog class="modal" bind:this={noPubKeyDialog}>
  <div class="modal-box flex flex-col items-center pt-3 pb-6 px-4">
    <div class="w-full flex justify-end mb-2">
      <button on:click={() => noPubKeyDialog.close()} class="btn btn-sm"
        >close</button
      >
    </div>
    {#if modalState === "getAccessToken"}
      <p class="mb-2 text-center">
        You can't enter the key because there is no diary record in this
        browser. However, if you have one and you've synced all your entries to
        your drive, please grant me access to your drive by clicking the button
        below so that I can retrieve those records.
      </p>
      <p class="font-medium mb-1">Choose Google Drive Account:</p>
      <GoogleButton {getAccessToken} />
      <a
        href="https://github.com/RoopkumarD/introspecta/blob/main/user-data.md"
        target="_blank"
        class="link mt-2 text-center">How data is handled by this app</a
      >
    {/if}
    {#if modalState === "retrievingPubKey"}
      <div class="waviy">
        <span style="--i:1">R</span>
        <span style="--i:2">e</span>
        <span style="--i:3">t</span>
        <span style="--i:4">r</span>
        <span style="--i:5">i</span>
        <span style="--i:6">e</span>
        <span style="--i:7">v</span>
        <span style="--i:9">i</span>
        <span style="--i:10">n</span>
        <span style="--i:11">g</span>
        <span style="--i:12">.</span>
        <span style="--i:13">.</span>
      </div>

      <p>the public key from drive</p>
    {/if}
    {#if modalState === "chooseAnotherAccount"}
      <p class="mb-2 text-center">
        Cool got the pubKey and also found the records. Now you can try to
        unlock, but if you feel like you choosed the wrong account. Don't worry,
        you can redo this process by clicking below
      </p>
      <button
        on:click={() => {
          revokeAccessToken();
          pubKey = null;
          modalState = changeModalState(modalState, "yesChooseAnother");
        }}
        class="btn-primary btn btn-sm btn-wide"
        >Change Google Drive Account</button
      >
    {/if}
    {#if modalState === "errShow"}
      <p class="text-center">
        There was a problem, please refer me the below error message at
        roopkumards@gmail.com
      </p>
      <p>{errMessage}</p>
    {/if}
    <div class="divider">OR</div>
    <p class="mb-1">If you don't have diary, create a new one by clicking on</p>
    <p class="text-secondary text-xl underline mb-2 font-medium">
      create a diary
    </p>
    <p class="mb-2">located below this button</p>
    <div
      class="py-1 w-[250px] rounded-md text-neutral-content bg-neutral font-medium uppercase text-sm text-center leading-4"
    >
      you can't open diary<br />click to know
    </div>
  </div>
</dialog>

<div
  class="absolute bottom-10 right-10 font-bold bg-accent p-2 rounded-md hidden xl:block"
>
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
        >you can't open diary<br />click to know</button
      >
    {/if}
    {#if pubKey !== null}
      <button on:click={unlockDiary} class="btn btn-primary btn-wide text-xl"
        >unlock</button
      >
    {/if}
    <div class="divider">OR</div>
    <button
      on:click={() => {
        revokeAccessToken();
        createKey = true;
      }}
      class="btn btn-link lowercase text-secondary text-xl"
      >create a diary</button
    >
  </div>
</main>

<style>
  /* credits -> https://codepen.io/alvarotrigo/pen/bGrXmwM*/
  .waviy {
    position: relative;
  }
  .waviy span {
    position: relative;
    display: inline-block;
    font-size: 40px;
    color: #fff;
    text-transform: uppercase;
    animation: flip 4s infinite;
    animation-delay: calc(0.2s * var(--i));
  }
  @keyframes flip {
    0%,
    80% {
      transform: rotateY(360deg);
    }
  }
</style>
