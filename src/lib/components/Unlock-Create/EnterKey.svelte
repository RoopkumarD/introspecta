<script lang="ts">
  import { onMount } from "svelte";
  import Input from "./Input.svelte";
  import toast from "svelte-french-toast";
  import {
    stage,
    entries,
    publicKeyStore,
    currentNotebook,
    notebooks,
  } from "$lib/store";
  import { createStore, values, setMany, clear } from "idb-keyval";
  import { pack } from "msgpackr";
  import { deserialiseDriveData, hashData } from "$lib/utils";
  import { downloadFile, revokeAccessToken } from "$lib/googleDrive";
  import { generateKeyPairs, decrypt } from "$lib/libsodium";
  import { goto } from "$app/navigation";
  import type { EncryptedEntries, serialisedEntries } from "$lib/types";
  import NoPubKey from "./NoPubKey.svelte";

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
          let data: serialisedEntries[] = [];
          try {
            data = await downloadFile(dataFileId);
          } catch (err) {
            if (err instanceof Error) {
              if (err.message === "errDownloadData") {
                reject("Err when downloading data from drive");
                return;
              } else if (err.message === "errWhileUnpackingBuffer") {
                reject("Err when deserialising the data retrieved from drive");
                return;
              } else if (err.message === "notAuthorized") {
                reject(
                  "Please login so that drive allows me to add data to their storage"
                );
                return;
              }
            } else {
              reject("error catch is not Error object, internal problem");
              return;
            }
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

    const { decryptedEntries, notebooksFromDecrypted } = await decrypt(
      passphrase.join(""),
      encryptedEntries
    );

    // now initialising the workspace
    const arrObject = Object.keys(decryptedEntries);

    if (arrObject.length !== 0) {
      $currentNotebook = notebooksFromDecrypted[0];
      $notebooks = notebooksFromDecrypted;
    } else {
      $currentNotebook = "default";
      $notebooks = ["default"];
    }

    $entries = decryptedEntries;
    $publicKeyStore = pubKey;
    $stage = "Dashboard";

    goto("/diary");
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

  let pubKey: string | null;

  let state: "localPubKey" | "remotePubKey" = "localPubKey";

  let showNoPubKeyDialog: boolean = false;
  let dataFileId = "";
  let modifiedTime = "";

  onMount(() => {
    pubKey = localStorage.getItem("pubKey");
    if (pubKey === null) {
      state = "remotePubKey";
    }
  });
</script>

<NoPubKey
  bind:showNoPubKeyDialog
  bind:pubKey
  bind:dataFileId
  bind:modifiedTime
/>

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
  <h1 class="font-bold mb-8 text-3xl lg:text-5xl">Unlock Diary</h1>
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
        on:click={() => (showNoPubKeyDialog = true)}
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
        goto("/create-diary");
      }}
      class="btn btn-link lowercase text-secondary text-xl"
      >create a diary</button
    >
  </div>
</main>
