<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import decrypt from "$lib/decrypt?worker";
  import Input from "./Input.svelte";
  import { wrap } from "comlink";
  import { values } from "idb-keyval";
  import toast, { Toaster } from "svelte-french-toast";
  import { stage, journalling } from "$lib/store";
  import { createStore } from "idb-keyval";

  export let createKey: boolean;

  interface EncryptedEntries {
    id: string;
    entry: string;
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

  const entriesStore = createStore("introspecta", "entries");
  async function unlockDiary() {
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

    // if user gave pass and it matched, thus correct pass and now we will start decryption
    const encryptedEntries: EncryptedEntries[] = await values(entriesStore);
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

  let passphrase: string[] = Array(5).fill("");
  let noPubKeyDialog: HTMLDialogElement;

  let pubKey: string | null;
  let pubKeyDisabled = false;
  onMount(() => {
    pubKey = localStorage.getItem("pubKey");
    if (pubKey === null) {
      pubKeyDisabled = true;
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
    <p class="font-medium">There is no public key saved in this browser.</p>
    <p class="font-medium mb-2">
      If you want to create new account, check below
    </p>
    <button
      on:click={() => noPubKeyDialog.close()}
      class="btn-primary btn btn-sm btn-wide">close</button
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
    {#if pubKey === null}
      <button
        on:click={() => noPubKeyDialog.showModal()}
        class="btn btn-neutral btn-wide mb-2"
        >you can't open journals, click to know</button
      >
    {/if}
    <button
      on:click={unlockDiary}
      disabled={pubKeyDisabled}
      class="btn btn-primary btn-wide text-xl">unlock</button
    >
    <div class="divider">OR</div>
    <button
      on:click={() => (createKey = true)}
      class="btn btn-link lowercase text-secondary text-xl"
      >create a account</button
    >
  </div>
</main>
