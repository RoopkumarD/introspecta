<script lang="ts">
  import { getWords } from "$lib/diceware/index";
  import eff from "$lib/diceware/eff";
  import { journalling, stage } from "$lib/store";
  import { clear, createStore } from "idb-keyval";
  import { generateKeyPairs } from "$lib/libsodium";

  export let createKey: boolean;

  const passphrase = getWords(5, 5, eff);
  let backed = false;
  let deletePreviousEntries = false;

  async function createKeyPairs() {
    if (localStorage.getItem("pubKey") !== null && !deletePreviousEntries) {
      dialog.showModal();
      return;
    }

    if (localStorage.getItem("pubKey") !== null && deletePreviousEntries) {
      // delete the previous stuff
      const theme = localStorage.getItem("theme");
      localStorage.clear();
      if (theme !== null) {
        localStorage.setItem("theme", theme);
      }
      const entriesStore = createStore("introspecta", "entries");
      await clear(entriesStore);
    }

    const { publicKey } = await generateKeyPairs(passphrase.join(""));
    localStorage.setItem("pubKey", publicKey);
    $journalling.pubKey = publicKey;
    $journalling.usedIds = new Set();
    $journalling.currentJournal = "default";
    $journalling.journals = ["default"];
    $journalling.entries = {
      default: [],
    };
    $stage = "Dashboard";
  }

  let dialog: HTMLDialogElement;
</script>

<dialog class="modal" bind:this={dialog}>
  <div class="modal-box leading-2">
    <p>There are some old entries in this browser</p>
    <p>If you want to delete them, then press continue</p>
    <p>If not then press cancel</p>
    <div class="flex gap-3 mt-4">
      <button on:click={() => dialog.close()} class="btn-secondary btn grow"
        >cancel</button
      >
      <button
        on:click={() => {
          deletePreviousEntries = true;
          createKeyPairs();
        }}
        class="btn-accent btn grow">continue</button
      >
    </div>
  </div>
</dialog>

<main
  class="font-inter flex flex-col items-center mt-10 lg:mt-24
  "
>
  <h1 class="font-bold mb-8 text-2xl lg:text-5xl text-center">
    Password Generated
  </h1>
  <div
    class="mb-8 py-4 px-2 bg-base-300 flex flex-col lg:flex-row flex-wrap items-center
    justify-center w-3/4 lg:w-1/2 gap-4"
  >
    {#each passphrase as word, index}
      <p class="text-2xl">
        <span>{index + 1}. </span><span>{word}</span>
      </p>
    {/each}
  </div>
  <div class="form-control mb-3">
    <label class="label cursor-pointer space-x-10 lg:space-x-24">
      <div class="flex items-center gap-2">
        <div
          class="tooltip tooltip-bottom font-medium xl:block hidden"
          data-tip="Write these 5 words in a paper where you feel safe or you
          can store it in your password manager"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-info"
            ><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path
              d="M12 8h.01"
            /></svg
          >
        </div>
        <span class="label-text text-md xl:text-lg font-medium">
          I have backed up my password</span
        >
      </div>
      <input
        type="checkbox"
        bind:checked={backed}
        class="checkbox checkbox-secondary"
      />
    </label>
  </div>
  <button
    disabled={!backed}
    on:click={createKeyPairs}
    class="btn btn-secondary btn-wide mb-3 text-xl">continue</button
  >
  <p
    class="text-error text-center w-3/4 lg:w-1/2 mb-12 text-sm
    lg:text-lg font-semibold"
  >
    *Important: I am using these 5 words to encrypt all of your entries. So
    please write them down somewhere safe as i am not storing these words
    anywhere.
  </p>
</main>
