<script lang="ts">
  import { API_KEY, DISCOVERY_DOC, CLIENT_ID } from "$lib/googleDrive";
  import { sodiumReady } from "$lib/libsodium";
  import { onMount } from "svelte";

  function gapiLoaded() {
    window.gapi.load("client", initializeGapiClient);
  }

  async function initializeGapiClient() {
    await window.gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: [DISCOVERY_DOC],
    });
  }

  onMount(() => {
    sodiumReady();
  });
</script>

<svelte:head>
  <script src="https://apis.google.com/js/api.js" on:load={gapiLoaded}></script>
  <script src="https://accounts.google.com/gsi/client" async></script>

  <meta name="google-signin-client_id" content={CLIENT_ID} />
</svelte:head>

<div class="block xl:hidden">
  <slot />
</div>
<div
  class="text-xl font-bold text-center px-4 gap-2 hidden xl:flex xl:flex-col xl:justify-center xl:items-center xl:h-screen"
>
  <p class="">This view is optimised for mobile</p>
  <p class="">
    Please visit <a class="link-primary underline" href="/desktop"
      >Desktop Version</a
    > for using this app via desktop
  </p>
</div>
