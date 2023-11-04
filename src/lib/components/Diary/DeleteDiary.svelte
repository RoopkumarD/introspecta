<script lang="ts">
  import { goto } from "$app/navigation";
  import { generateKeyPairs } from "$lib/libsodium";
  import { publicKeyStore, stage } from "$lib/store";
  import { clear, createStore } from "idb-keyval";
  import toast from "svelte-french-toast";

  type State = "view" | "givePass" | "loading";
  type States = {
    [currentState: string]: {
      [action: string]: State;
    };
  };

  const states: States = {
    view: {
      deleteButton: "givePass",
    },
    givePass: {
      cancel: "view",
      proceedButton: "loading",
    },
    loading: {},
  };
  let state: State = "view";

  function changeState(currentState: State, action: string) {
    return states[currentState][action];
  }

  let passwordString: string = "";

  async function proceedWithDelete() {
    if (passwordString === "") {
      toast.error("Need Password to proceed");
      return;
    }

    const { publicKey } = await generateKeyPairs(passwordString);

    if ($publicKeyStore !== publicKey) {
      toast.error("Password given is wrong");
      return;
    }

    state = changeState(state, "proceedButton");

    // clearing data from browser storage
    localStorage.clear();
    await clear(createStore("introspecta", "entries"));

    // re-setting all store
    $stage = "Login";

    goto("/unlock-diary");
    return;
  }
</script>

<div id="backup-sync-change" class="">
  <h3 class="font-bold text-lg mb-2 underline">Delete Entire Diary</h3>

  {#if state === "view"}
    <p>This will delete entire diary from this browser</p>
    <button
      on:click={() => {
        state = changeState(state, "deleteButton");
      }}
      class="btn btn-error my-2">Delete Diary</button
    >
    <p>
      Don't forget to delete the 'introspecta-data.msp' file from your Google
      Drive storage
    </p>
  {/if}
  {#if state === "givePass"}
    <label class="label" for="notebookName">
      <span class="label-text">Give me password to proceed</span>
    </label>
    <input
      name="notebookName"
      type="text"
      bind:value={passwordString}
      placeholder="Pass...."
      class="input input-bordered w-full"
    />
    <div class="join space-x-6 inline-flex w-full mt-3">
      <button
        on:click={() => {
          state = changeState(state, "cancel");
          passwordString = "";
        }}
        class="btn btn-secondary !rounded-r-md join-item grow">Cancel</button
      >
      <button
        on:click={proceedWithDelete}
        class="btn btn-primary !rounded-l-md join-item grow">Proceed</button
      >
    </div>
  {/if}
  {#if state === "loading"}
    <p>Deleting...</p>
  {/if}
</div>
