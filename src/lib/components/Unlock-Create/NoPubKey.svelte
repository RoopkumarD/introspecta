<script lang="ts">
  import GoogleButton from "$lib/components/GoogleButton.svelte";
  import {
    SCOPES,
    CLIENT_ID,
    getFileMetadata,
    revokeAccessToken,
  } from "$lib/googleDrive";

  export let showNoPubKeyDialog: boolean,
    pubKey: string | null,
    dataFileId: string,
    modifiedTime: string;
  let noPubKeyDialog: HTMLDialogElement;
  $: if (noPubKeyDialog && showNoPubKeyDialog) noPubKeyDialog.showModal();

  interface ModalStates {
    [modalState: string]: {
      [action: string]: ModalState;
    };
  }

  const modalStates: ModalStates = {
    getAccessToken: {
      gotAccessToken: "retrievingPubKey",
      errWhileAccessingToken: "errShow",
    },
    retrievingPubKey: {
      gotPubKey: "chooseAnotherAccount",
      errRetrieving: "errShow",
    },
    errShow: {},
    chooseAnotherAccount: {
      yesChooseAnother: "getAccessToken",
    },
  };

  type ModalState =
    | "getAccessToken"
    | "retrievingPubKey"
    | "chooseAnotherAccount"
    | "errShow";

  let modalState: ModalState = "getAccessToken";
  function changeModalState(currentState: string, action: string) {
    return modalStates[currentState][action];
  }

  let errMessage = ""; // need to learn how in fsm, i can show this side effect
  async function getAccessToken() {
    if (window.google === undefined) {
      errMessage = "Google GSI is not loaded properly, internal problem";
      modalState = changeModalState(modalState, "errWhileAccessingToken");
      return;
    }

    let clientInit = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (res) => {
        if (res.error) {
          errMessage = "Err while authorizing, to get access token";
          console.error(res.error);
          modalState = changeModalState(modalState, "errWhileAccessingToken");
          return;
        }

        modalState = changeModalState(modalState, "gotAccessToken");
        retrievePubKey();
      },
    });

    clientInit.requestAccessToken();
  }

  async function retrievePubKey() {
    let metaDatas: {
      id: string;
      modifiedTime: string;
      pubKey: string;
      entries: string;
    } | null = null;
    try {
      metaDatas = await getFileMetadata();
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === "errListFile") {
          errMessage = "Err while finding introspecta file";
          modalState = changeModalState(modalState, "errWhileSync");
          return;
        } else if (err.message === "responseFieldsUndefined") {
          errMessage =
            "Response from google drive didn't include important data, internal problem";
          modalState = changeModalState(modalState, "errWhileSync");
          return;
        } else if (err.message === "entriesNotStored") {
          errMessage =
            "File data is modified by someone, please reach out to me";
          modalState = changeModalState(modalState, "errWhileSync");
          return;
        } else if (err.message === "pubKeyNotStored") {
          errMessage =
            "File data doesn't contain pubKey, please reach out to me";
          modalState = changeModalState(modalState, "errWhileSync");
          return;
        }
      } else {
        errMessage = "error catch is not Error object, internal problem";
        modalState = changeModalState(modalState, "errWhileSync");
        return;
      }
    }

    if (metaDatas === null) {
      errMessage = "introspecta file doesn't exists";
      modalState = changeModalState(modalState, "errRetrieving");
      return;
    }

    pubKey = metaDatas.pubKey;
    dataFileId = metaDatas.id;
    modifiedTime = metaDatas.modifiedTime;

    modalState = changeModalState(modalState, "gotPubKey");

    return;
  }
</script>

<dialog
  class="modal"
  bind:this={noPubKeyDialog}
  on:close={() => (showNoPubKeyDialog = false)}
>
  <div class="modal-box flex flex-col items-center pt-3 pb-6 px-4">
    <div class="w-full flex justify-end mb-2">
      <button on:click={() => noPubKeyDialog.close()} class="btn btn-sm"
        >close</button
      >
    </div>
    {#if modalState === "getAccessToken"}
      <p class="mb-2 text-center">
        You can't enter the key because there is no diary record in this
        browser. However, if you have one and you've synced all your entries to
        your drive, please grant me access to your drive by clicking the button
        below so that I can retrieve those records.
      </p>
      <p class="font-medium mb-1">Choose Google Drive Account:</p>
      <GoogleButton {getAccessToken} />
      <a
        href="https://github.com/RoopkumarD/introspecta/blob/main/user-data.md"
        target="_blank"
        class="link mt-2 text-center">How data is handled by this app</a
      >
    {/if}
    {#if modalState === "retrievingPubKey"}
      <div class="waviy">
        <span style="--i:1">R</span>
        <span style="--i:2">e</span>
        <span style="--i:3">t</span>
        <span style="--i:4">r</span>
        <span style="--i:5">i</span>
        <span style="--i:6">e</span>
        <span style="--i:7">v</span>
        <span style="--i:9">i</span>
        <span style="--i:10">n</span>
        <span style="--i:11">g</span>
        <span style="--i:12">.</span>
        <span style="--i:13">.</span>
      </div>

      <p>the public key from drive</p>
    {/if}
    {#if modalState === "chooseAnotherAccount"}
      <p class="mb-2 text-center">
        Cool got the pubKey and also found the records. Now you can try to
        unlock, but if you feel like you choosed the wrong account. Don't worry,
        you can redo this process by clicking below
      </p>
      <button
        on:click={() => {
          revokeAccessToken();
          pubKey = null;
          modalState = changeModalState(modalState, "yesChooseAnother");
        }}
        class="btn-primary btn btn-sm btn-wide"
        >Change Google Drive Account</button
      >
    {/if}
    {#if modalState === "errShow"}
      <p class="text-center">
        There was a problem, please refer me the below error message at
        roopkumards@gmail.com
      </p>
      <p>{errMessage}</p>
    {/if}
    <div class="divider">OR</div>
    <p class="mb-1">If you don't have diary, create a new one by clicking on</p>
    <p class="text-secondary text-xl underline mb-2 font-medium">
      create a diary
    </p>
    <p class="mb-2">located below this button</p>
    <div
      class="py-1 w-[250px] rounded-md text-neutral-content bg-neutral font-medium uppercase text-sm text-center leading-4"
    >
      you can't open diary<br />click to know
    </div>
  </div>
</dialog>

<style>
  /* credits -> https://codepen.io/alvarotrigo/pen/bGrXmwM*/
  .waviy {
    position: relative;
  }
  .waviy span {
    position: relative;
    display: inline-block;
    font-size: 40px;
    color: #fff;
    text-transform: uppercase;
    animation: flip 4s infinite;
    animation-delay: calc(0.2s * var(--i));
  }
  @keyframes flip {
    0%,
    80% {
      transform: rotateY(360deg);
    }
  }
</style>
