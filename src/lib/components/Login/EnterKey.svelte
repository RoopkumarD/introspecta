<script lang="ts">
  import { onMount } from "svelte";
  import Input from "./Input.svelte";

  export let createKey: boolean;

  let passphrase = Array(5).fill("");
  let noPubKeyDialog: HTMLDialogElement;

  let pubKey: string | null;
  let pubKeyDisabled = false;
  onMount(() => {
    pubKey = localStorage.getItem("pubKey");
    if (pubKey === null) {
      pubKeyDisabled = true;
    }
  });
</script>

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
    <button disabled={pubKeyDisabled} class="btn btn-primary btn-wide text-xl"
      >unlock</button
    >
    <div class="divider">OR</div>
    <button
      on:click={() => (createKey = true)}
      class="btn btn-link lowercase text-secondary text-xl"
      >create a account</button
    >
  </div>
</main>
