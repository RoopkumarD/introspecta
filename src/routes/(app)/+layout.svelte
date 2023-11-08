<script lang="ts">
  import { API_KEY, DISCOVERY_DOC, CLIENT_ID } from "$lib/googleDrive";
  import { sodiumReady } from "$lib/libsodium";
  import { onMount } from "svelte";
  import { Toaster } from "svelte-french-toast";
  import WarningModal from "$lib/components/WarningModal.svelte";

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

<Toaster />
<WarningModal />

<slot />
