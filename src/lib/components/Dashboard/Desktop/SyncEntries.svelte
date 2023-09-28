<script lang="ts">
  import { createStore, keys, update, values } from "idb-keyval";
  import { pack } from "msgpackr";
  import { journalling } from "$lib/store";

  export let syncModalShow: boolean;

  let syncModal: HTMLDialogElement;

  let clientInit: any;

  interface resOfInitTokenClient {
    access_token: string;
    expires_in: number;
    scope: string;
    token_type: string;
  }

  let clientToken: resOfInitTokenClient | null = null;
  let syncWait = false;
  const entriesStore = createStore("introspecta", "entries");

  async function getAccessToken() {
    clientInit = window.google.accounts.oauth2.initTokenClient({
      client_id:
        "957316931-j7al5upb33rnqvmb5sapvp7771h4h9bo.apps.googleusercontent.com",
      scope: "https://www.googleapis.com/auth/drive.file",
      callback: (res: resOfInitTokenClient) => {
        clientToken = res;

        syncWait = true;
        syncTime();
      },
    });

    clientInit.requestAccessToken();
  }

  async function syncTime() {
    const lastTimeSynced = localStorage.getItem("lastTimeSynced");

    if (clientToken === null) {
      console.log("client token is null");
      return;
    }

    if (lastTimeSynced === null) {
      // meaning new sync, i know that users can troll and delete the lastTimeSynced key from
      // localStorage will see later on how to deal with that

      const timestamp = new Date().getTime();
      const keyIds = await keys(entriesStore);

      const promises = keyIds.map(async (id) => {
        await update(
          id,
          (val) => {
            return {
              ...val,
              lastSyncTime: timestamp,
            };
          },
          entriesStore
        );
      });

      try {
        await Promise.all(promises);
      } catch (err) {
        console.log(err);
        return;
      }

      const data = await values(entriesStore);

      const encodedVersion = pack({
        data: data,
        deleted: [],
      });

      const formData = new FormData();

      const blob = new Blob([encodedVersion], {
        type: "application/msgpack",
      });
      formData.append("data", blob, "data.msgpack");
      formData.append("accessToken", clientToken.access_token);
      formData.append("pubKey", $journalling.pubKey);

      const response = await fetch("/api/updateData", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log(result);

      syncWait = false;
    }
  }

  $: if (syncModal && syncModalShow) syncModal.showModal();
</script>

<dialog
  class="modal"
  bind:this={syncModal}
  on:close={() => (syncModalShow = false)}
>
  <div class="modal-box flex flex-col items-center gap-2">
    <div class="flex justify-end w-full">
      <button on:click={() => syncModal.close()} class="btn-ghost btn btn-xs"
        >close</button
      >
    </div>
    <div id="note" class="mb-2 bg-primary p-2 rounded-md">
      <p class="font-medium">
        Sry, I know i am being annoying here. But before syncing, please go to
        this <a
          class="link"
          href="https://github.com/RoopkumarD/introspecta#backup">link</a
        >
        where i have explained how sync works. Don't worry it won't involved any
        technical details. It's just answer question like why do you have to login
        again and again and when you should sync ideally
      </p>
    </div>
    {#if syncWait === false}
      <button on:click={getAccessToken} class="btn-secondary btn btn-wide"
        >Google Login</button
      >
    {:else}
      Cool, just a sec, let me sync stuff in background
    {/if}
  </div>
</dialog>
