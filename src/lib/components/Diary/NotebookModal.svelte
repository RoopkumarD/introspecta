<script lang="ts">
  import { currentNotebook, entries } from "$lib/store";

  export let showModal: boolean;

  type State = "view" | "add";
  interface States {
    [stateName: string]: {
      [actionName: string]: State;
    };
  }

  let dialog: HTMLDialogElement;
  let showGiveName: boolean = false;
  let notebookName: string = "";
  let state: State = "view";
  const states: States = {
    view: {
      createButton: "add",
    },
    add: {
      cancel: "view",
      createNotebook: "view",
    },
  };

  function changeState(currentState: string, action: string) {
    return states[currentState][action];
  }

  function choosedJournal(journal: string) {
    $currentNotebook = journal;
    return;
  }

  function createNewNotebook() {
    if (notebookName === "") {
      showGiveName = true;
      return;
    }

    $entries[notebookName] = {};
    $currentNotebook = notebookName;

    state = changeState(state, "createNotebook");
    showGiveName = false;
    notebookName = "";
    return;
  }

  $: if (dialog && showModal) {
    dialog.showModal();
  }
</script>

<dialog
  class="modal"
  bind:this={dialog}
  on:close={() => {
    showModal = false;
    showGiveName = false;
    notebookName = "";
    state = "view";
  }}
>
  <div class="modal-box">
    <div
      class="flex justify-between items-center border-b-2 border-neutral pb-2 mb-4"
    >
      <p class="font-semibold text-sm">Notebooks</p>
      <button on:click={() => dialog.close()} class="btn btn-ghost btn-sm"
        >close</button
      >
    </div>
    <div>
      {#if state === "view"}
        <h3 class="font-medium text-xl">
          Current Notebook: {$currentNotebook}
        </h3>
        <div class="flex flex-col space-y-4 my-8">
          {#each Object.keys($entries) as notebook}
            <div class="flex justify-between items-center">
              <p>{notebook}</p>
              <button
                on:click={() => choosedJournal(notebook)}
                class="btn btn-xs">choose</button
              >
            </div>
          {/each}
        </div>
        <button
          on:click={() => (state = changeState(state, "createButton"))}
          class="btn btn-block btn-primary">Create New Notebook</button
        >
        <p class="mt-4 text-accent font-semibold">
          Empty Notebooks are automatically deleted
        </p>
      {/if}
      {#if state === "add"}
        <label class="label" for="notebookName">
          <span class="label-text">Give Name of Notebook</span>
        </label>
        <input
          name="notebookName"
          type="text"
          bind:value={notebookName}
          placeholder="Name here..."
          class="input input-bordered w-full"
        />
        {#if showGiveName}
          <p class="text-warning mt-3">I need a name to create notebook</p>
        {/if}
        <div class="join space-x-6 inline-flex w-full mt-3">
          <button
            on:click={() => {
              state = changeState(state, "cancel");
              showGiveName = false;
              notebookName = "";
            }}
            class="btn btn-secondary !rounded-r-md join-item grow"
            >Cancel</button
          >
          <button
            on:click={createNewNotebook}
            class="btn btn-primary !rounded-l-md join-item grow">Create</button
          >
        </div>
      {/if}
    </div>
  </div>
</dialog>
