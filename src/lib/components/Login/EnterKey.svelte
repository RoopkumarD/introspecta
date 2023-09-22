<script lang="ts">
  import Input from "./Input.svelte";

  export let createKey: boolean;

  let passphrase = Array(5).fill("");
</script>

<main
  class="font-inter flex flex-col items-center mt-24
  "
>
  <h1 class="text-black font-bold mb-8 text-3xl lg:text-5xl">Unlock Journal</h1>
  <div
    class="mb-8 flex flex-wrap items-center justify-center w-full lg:w-1/2 gap-4"
  >
    {#each Array(5) as _, i}
      <Input disabled={false} bind:value={passphrase[i]} index={i + 1} />
    {/each}
  </div>
  <button class="btn btn-primary btn-wide text-xl">unlock</button>
  <button
    on:click={() => (createKey = true)}
    class="btn btn-link lowercase text-neutral">create a account</button
  >
</main>
