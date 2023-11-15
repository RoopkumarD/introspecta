<script lang="ts">
  import ThemeChooser from "$lib/components/ThemeChooser.svelte";
  import DiaryExistsBox from "$lib/components/Unlock-Create/DiaryExistsBox.svelte";
  import type { PageData } from "./$types";
  import { publicKeyStore, currentNotebook, entries, stage } from "$lib/store";
  import { generateKeyPairs } from "$lib/libsodium";
  import { goto } from "$app/navigation";
  import toast from "svelte-french-toast";

  export let data: PageData;

  let password: string = "";
  let confirmPassword: string = "";

  let showPass: boolean = false;
  let inputPassElem: HTMLInputElement;
  let inputConfElem: HTMLInputElement;

  $: {
    changeVisibility(showPass);
  }

  function changeVisibility(showPass: boolean) {
    if (inputPassElem === undefined || inputConfElem === undefined) {
      return;
    }

    if (showPass === false) {
      inputPassElem.setAttribute("type", "password");
      inputConfElem.setAttribute("type", "password");
    } else {
      inputPassElem.setAttribute("type", "text");
      inputConfElem.setAttribute("type", "text");
    }
  }

  async function createKeyPairs() {
    if (password === "") {
      toast.error("Password can't be empty");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("password and confirm password doesn't match");
      return;
    }

    if (password.length < 10) {
      toast.error("Password length should be atleast 10");
      return;
    }

    const { publicKey } = await generateKeyPairs(password);
    localStorage.setItem("pubKey", publicKey);
    $publicKeyStore = publicKey;
    $currentNotebook = "default";
    $entries = {
      default: {},
    };
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
  class="flex flex-col items-center mt-10
  "
>
  <h1 class="font-bold mb-7 text-2xl lg:text-3xl text-center">
    Create Password for Diary
  </h1>
  {#if data.diaryExists === true}
    <DiaryExistsBox />
  {/if}
  <form class="mb-6 flex flex-col items-center gap-2 w-full">
    <div>
      <label class="label" for="createPass">Password:</label>
      <input
        name="createPass"
        class="px-4 py-2 peer mb-4 bg-transparent text-md md:text-xl border-[1px] border-base-300 rounded-lg w-80 lg:w-96"
        bind:value={password}
        bind:this={inputPassElem}
        type="password"
        placeholder="password"
        autocomplete="new-password"
      />
      <div
        class="bg-base-300 hidden peer-focus:block w-80 lg:w-96 space-y-2 p-2 font-medium rounded-md"
      >
        <p class={`${password.length >= 10 ? "text-success" : "text-error"}`}>
          {#if password.length >= 10}
            <span>✔</span>
          {:else}
            <span>✘</span>
          {/if}
          atleast 10 characters
        </p>
        <p>
          This password will be used to encrypt your diary logs, so it's crucial
          to select a strong one. You can also utilize this <a
            href="https://diceware.dmuth.org/"
            target="_blank"
            tabindex="-1"
            class="link">website</a
          > to generate a robust password.
        </p>
      </div>
    </div>
    <div>
      <label class="label" for="createPass">Confirm Password:</label>
      <input
        name="createPass"
        class={`px-4 py-2 bg-transparent text-md md:text-xl outline-none border-[1px] ${
          password !== confirmPassword ? "border-accent" : "border-base-300"
        } rounded-lg w-80 lg:w-96`}
        bind:value={confirmPassword}
        bind:this={inputConfElem}
        type="password"
        placeholder="password"
      />
    </div>
    <div class="form-control flex justify-between w-64 mt-2">
      <label class="label cursor-pointer">
        <span class="label-text">Show Password</span>
        <input type="checkbox" class="toggle" bind:checked={showPass} />
      </label>
    </div>
  </form>
  <p class="text-error font-medium w-80 px-2 lg:w-96 mb-8">
    Note: I do not store this password, so I won't be able to help you recover
    it. Please make sure to store this password in a secure place.
  </p>
  <button
    on:click={createKeyPairs}
    disabled={data.diaryExists}
    class="btn btn-secondary btn-wide text-xl">create diary</button
  >
  <div class="flex flex-col items-center mb-10">
    <div class="divider mt-8 mb-4">OR</div>
    <button
      on:click={() => {
        goto("/unlock-diary");
      }}
      class="btn btn-link lowercase text-accent text-xl"
      >unlock existing diary</button
    >
  </div>
</main>
