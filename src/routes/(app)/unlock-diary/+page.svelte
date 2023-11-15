<script lang="ts">
  import ThemeChooser from "$lib/components/ThemeChooser.svelte";
  import type { PageData } from "./$types";
  import type { EncryptedEntries } from "$lib/types";
  import toast from "svelte-french-toast";
  import { createStore, values } from "idb-keyval";
  import { generateKeyPairs, decrypt } from "$lib/libsodium";
  import { goto } from "$app/navigation";
  import { publicKeyStore, entries, currentNotebook, stage } from "$lib/store";

  export let data: PageData;

  let password: string = "";
  let showPass: boolean = false;
  let inputElem: HTMLInputElement;

  $: {
    changeVisibility(showPass);
  }

  function changeVisibility(showPass: boolean) {
    if (inputElem === undefined) {
      return;
    }

    if (showPass === false) {
      inputElem.setAttribute("type", "password");
    } else {
      inputElem.setAttribute("type", "text");
    }
  }

  const entriesStore = createStore("introspecta", "entries");

  async function unlockDiary() {
    if (password === "") {
      toast.error("Bro give me full pass");
      return;
    }

    // checking if passphrase is correct or not
    const genPubKey = await generateKeyPairs(password);
    if (genPubKey.publicKey !== data.pubKeyLocal) {
      toast.error("Password isn't matching with saved one");
      return;
    }

    let encryptedEntries: EncryptedEntries[] = await values(entriesStore);

    const { decryptedEntries } = await decrypt(password, encryptedEntries);

    // now initialising the workspace
    const arrObject = Object.keys(decryptedEntries);

    if (arrObject.length !== 0) {
      $currentNotebook = arrObject[0];
      $entries = decryptedEntries;
    } else {
      $currentNotebook = "default";
      $entries = {
        default: {},
      };
    }

    $publicKeyStore = data.pubKeyLocal;
    $stage = "Dashboard";

    goto("/diary");
  }
</script>

<nav class="flex justify-between items-center px-4 pt-4 xl:px-8">
  <h1 class="font-abrilFatFace text-xl">
    introspecta<span class="bg-primary ml-2 p-1 rounded-md text-sm">beta</span>
  </h1>
  <ThemeChooser />
</nav>

<main
  class="flex flex-col justify-center items-center mt-20
  "
>
  <h1 class="font-bold mb-10 text-3xl lg:text-5xl">Unlock Diary</h1>
  {#if data.diaryExists}
    <form>
      <input
        class="px-4 py-2 bg-transparent text-md md:text-xl border-[1px] border-base-300 rounded-lg w-64"
        bind:value={password}
        bind:this={inputElem}
        type="password"
        placeholder="password"
        autocomplete="current-password"
      />
      <div class="form-control flex justify-between w-64 mt-2">
        <label class="label cursor-pointer">
          <span class="label-text">Show Password</span>
          <input type="checkbox" class="toggle" bind:checked={showPass} />
        </label>
      </div>
      <button
        on:click={unlockDiary}
        class="btn btn-primary btn-wide text-xl mt-4">unlock</button
      >
    </form>
  {:else}
    <div class="text-center font-medium text-lg space-y-3 w-10/12 lg:w-[400px]">
      <p class="">I couldn't locate any diary data in this browser.</p>
      <p>
        If you have data that has been synchronized or backed up to your Google
        Drive storage, you can import it using the link below.
      </p>
    </div>
  {/if}
  <div class="flex flex-col items-center">
    <div class="divider mt-8 mb-6">OR</div>
    <button
      on:click={() => {
        goto("/create-diary");
      }}
      class="btn btn-link lowercase text-accent text-xl">create a diary</button
    >
    <button
      on:click={() => {
        goto("/import-diary");
      }}
      class="btn btn-link normal-case text-secondary text-xl mt-4"
      >import diary from<br />Google Drive</button
    >
  </div>
</main>
