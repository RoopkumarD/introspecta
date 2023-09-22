<script lang="ts">
  import { getWords } from "$lib/diceware/index";
  import eff from "$lib/diceware/eff";

  const passphrase = getWords(5, 5, eff);
  let backed = false;
</script>

<main
  class="font-inter flex flex-col items-center mt-10 lg:mt-24
  "
>
  <h1 class="text-black font-bold mb-8 text-2xl lg:text-5xl">
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
      <span class="label-text font-semibold">I have backed up my password</span>
      <input
        type="checkbox"
        bind:checked={backed}
        class="checkbox checkbox-secondary"
      />
    </label>
  </div>
  <button disabled={!backed} class="btn btn-secondary btn-wide mb-3 text-xl"
    >continue</button
  >
  <p
    class="text-error text-center w-3/4 lg:w-1/2 mb-12 text-sm
    lg:text-lg"
  >
    *Important: please write this password down somewhere. Since i am not saving
    this anywhere, thus i won't be able to recover it if you lose it
  </p>
</main>
