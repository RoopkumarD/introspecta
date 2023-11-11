<script lang="ts">
  import Footer from "$lib/components/Landing/Footer.svelte";
  import Nav from "$lib/components/Landing/Nav.svelte";
  import Tweet from "$lib/components/Landing/Tweet.svelte";
</script>

<Nav />

<div class="hero min-h-screen bg-base-200">
  <div class="hero-content text-center">
    <div class="max-w-xl">
      <h1 class="font-extrabold text-3xl lg:text-4xl mb-4">
        WANT TO WRITE DIARY ENTRIES SOMEWHERE SAFE?
      </h1>
      <p class="mb-10 text-xl mx-auto">
        A DIARY APP 📔 THAT HELPS YOU WRITE ENCRYPTED ENTRIES STORED SECURELY IN
        YOUR BROWSER
      </p>
      <a href="/unlock-diary" class="btn btn-lg btn-primary"
        >Unlock Your<br />Thoughts Securely</a
      >
    </div>
  </div>
</div>

<section class="py-10">
  <h2 class="text-2xl lg:text-3xl text-center font-extrabold mb-10">
    HOW THIS APP WORKS?
  </h2>
  <div id="showcase" class="w-full text-xl image-card space-y-14 lg:space-y-10">
    <div
      class="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-14"
    >
      <img
        class="border-[1px] border-base-200 italic rounded-md w-full h-auto lg:h-44 lg:w-auto drop-shadow-xl"
        alt="create key screen"
        src="/create-key.webp"
      />
      <div id="info">
        <h3 class="font-bold">Create Diary with Password</h3>
        <p class="lg:max-w-md">
          Create a diary in your web browser with a password, which encrypts all
          your logs. Each time you open your diary, you'll need to enter the
          password to unlock it
        </p>
      </div>
    </div>

    <div
      class="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-14"
    >
      <img
        class="border-[1px] border-base-200 italic rounded-md w-full h-auto lg:h-44 lg:w-auto drop-shadow-xl"
        alt="create-entry"
        src="/create-entry.webp"
      />
      <div id="info">
        <h3 class="font-bold">Create Entries</h3>
        <p class="">
          All entries are encrypted using the password you provided during diary
          creation. The encrypted entries are stored in your browser's storage.
          To see them, right-click -&gt; inspect -&gt; application -&gt;
          indexeddb -&gt; introspecta -&gt; entries
        </p>
      </div>
    </div>

    <div
      class="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-14"
    >
      <img
        class="border-[1px] border-base-200 italic rounded-md w-full h-auto lg:h-44 lg:w-auto drop-shadow-xl"
        alt="sync-entry"
        src="/sync.webp"
      />
      <div id="info">
        <h3 class="font-bold">Sync with your Drive Storage</h3>
        <p class="">
          Use the sync feature to access your entries on different devices or
          browsers. It stores all encrypted entries in your Google Drive account
        </p>
      </div>
    </div>
  </div>
</section>

<section class="bg-base-200 py-10 flex flex-col items-center">
  <h2
    class="text-2xl lg:text-3xl text-center px-8 font-extrabold uppercase mb-10"
  >
    Where do I put my credit card details?
  </h2>
  <div class="image-card">
    <div class="max-w-xl">
      <div class="font-medium text-xl space-y-8 mb-9">
        <h3>You don't have to, because this app will always be free</h3>
        <h3>
          Although, I'd appreciate your feedback on this app. Just click on
          "comment" on the tweet
        </h3>
        <h3>
          If you don’t like anything, please feel free to comment as it will
          help me to improve the app
        </h3>
      </div>
      <Tweet />
    </div>
  </div>
</section>

<section class="image-card">
  <div class="flex flex-col items-center py-16">
    <h2 class="text-2xl lg:text-3xl text-center font-extrabold uppercase mb-6">
      Write entries now without worrying about privacy
    </h2>
    <a href="/unlock-diary" class="btn lg:btn-lg btn-primary"
      >Begin Your Journaling Journey<br />with Introspecta
    </a>
  </div>
</section>

<Footer />

<style>
  .image-card {
    --padding-inline: 2rem;
    --content-max-width: 70ch;

    display: grid;
    grid-template-columns:
      minmax(var(--padding-inline), 1fr) [content-start] min(
        100% - (var(--padding-inline) * 2),
        var(--content-max-width)
      )
      [content-end] minmax(var(--padding-inline), 1fr);
  }

  .image-card > * {
    grid-column: content;
  }
</style>
