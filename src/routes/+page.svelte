<script lang="ts">
  import Footer from "$lib/components/Landing/Footer.svelte";
  import Tweet from "$lib/components/Landing/Tweet.svelte";
  import { onMount } from "svelte";

  let first: HTMLDivElement;
  let second: HTMLDivElement;
  let third: HTMLDivElement;
  let aTag: HTMLAnchorElement;
  let commentTag: HTMLSpanElement;

  onMount(async () => {
    const { LeaderLine } = await import("$lib/leader");
    new LeaderLine(first, second, {
      color: "#7d919b",
      dash: { animation: true },
      size: 2,
      endPlugSize: 1,
    });

    new LeaderLine(second, third, {
      color: "#7d919b",
      dash: { animation: true },
      size: 2,
      endPlugSize: 1,
    });

    new LeaderLine(commentTag, aTag, {
      color: "#eb6b47",
      dash: { animation: true },
      startSocket: "bottom",
      endSocket: "top",
      size: 2,
      endPlugSize: 1,
    });
  });
</script>

<div class="bg-base-200">
  <header class="flex items-center justify-between mx-8 py-5">
    <h3 class="text-lg font-abrilFatFace">
      introspecta<span class="bg-primary ml-2 p-1 rounded-md text-sm">beta</span
      >
    </h3>
    <a href="/unlock-diary" class="btn btn-secondary !rounded-none btn-sm"
      >Open Diary</a
    >
  </header>
  <main class="image-card mt-24">
    <div class="flex flex-col items-center">
      <h1 class="font-extrabold text-3xl lg:text-4xl mb-4 text-center max-w-xl">
        WANT TO WRITE DIARY ENTRIES SOMEWHERE SAFE?
      </h1>
      <p class="mb-10 text-lg lg:text-xl text-center max-w-xl">
        A DIARY APP 📔 THAT HELPS YOU WRITE ENCRYPTED ENTRIES STORED SECURELY IN
        YOUR BROWSER
      </p>
      <a href="/unlock-diary" class="btn btn-lg btn-primary mb-20"
        >Unlock Your<br />Thoughts Securely</a
      >
      <div class="w-full relative">
        <span
          class="absolute z-50 -right-4 -bottom-5 md:-right-8 lg:-right-11 md:-bottom-11 bg-accent text-accent-content rounded-full text-center w-min p-4 aspect-square"
        >
          Free Forever
        </span>
        <img
          src="/desktop-view.png"
          alt="desktop-view-ui"
          class="rounded-t-md hidden md:block"
        />
        <img
          src="/mobile-view.jpg"
          alt="mobile-view-ui"
          class="rounded-t-md block md:hidden"
        />
      </div>
    </div>
  </main>
</div>

<div class="drop-shadow-[0_-4px_10px_rgba(0,0,0,0.25)]">
  <div class="bg-gradient-to-b from-base-100 to-base-200">
    <section class="py-10">
      <h2
        class="text-2xl lg:text-3xl underline underline-offset-4 decoration-1 text-center font-extrabold mb-10 mx-2"
      >
        HOW INTROSPECTA WORKS?
      </h2>
      <div
        class="flex flex-col lg:flex-row lg:justify-evenly items-center lg:items-start gap-8 lg:gap-auto"
      >
        <div bind:this={first} class="card card-compact w-72">
          <figure>
            <img
              class="border-[1px] border-base-200 italic rounded-md"
              src="/create-pass.png"
              alt="create-pass-ui"
            />
          </figure>
          <div class="card-body">
            <h2 class="card-title">Create Diary with Password</h2>
            <p>
              Create a diary in your web browser with a password, which encrypts
              all your logs. Each time you open your diary, you'll need to enter
              the password to unlock it
            </p>
          </div>
        </div>

        <div bind:this={second} class="card card-compact w-72">
          <figure>
            <img
              class="border-[1px] border-base-200 italic rounded-md"
              src="/create-entry.png"
              alt="create-entry-ui"
            />
          </figure>
          <div class="card-body">
            <h2 class="card-title">Create Entries</h2>
            <p>
              All entries are encrypted using the password you provided during
              diary creation. The encrypted entries are stored in your browser's
              storage
            </p>
          </div>
        </div>

        <div bind:this={third} class="card card-compact w-72">
          <figure>
            <img
              class="border-[1px] border-base-200 italic rounded-md"
              src="/sync.png"
              alt="sync-entry"
            />
          </figure>
          <div class="card-body">
            <h3 class="card-title">Sync with your Google Drive Storage</h3>
            <p>
              This is optional unless you want backups or cross-device access. I
              chose this because I don't want your data to be stored in my
              database
            </p>
          </div>
        </div>
      </div>
    </section>

    <section
      class="flex flex-col lg:flex-row gap-8 justify-evenly items-center px-10 pb-10 mt-8"
    >
      <Tweet bind:aTag />
      <div class="">
        <h2 class="text-xl font-bold mb-4">
          I'd appreciate your feedback on this app
        </h2>
        <div class="max-w-sm space-y-2">
          <p>
            If you don’t like anything, please feel free to comment as it will
            help me to improve the app
          </p>
          <p>
            Click on <span bind:this={commentTag}>"comment"</span> on the tweet
          </p>
        </div>
      </div>
    </section>
  </div>

  <section class="image-card bg-base-200">
    <div class="flex flex-col items-center py-16">
      <h2
        class="text-2xl lg:text-3xl text-center font-extrabold uppercase mb-6"
      >
        Write entries now without worrying about privacy
      </h2>
      <a href="/unlock-diary" class="btn lg:btn-lg btn-primary"
        >Start Your First Diary<br />with Introspecta
      </a>
    </div>
  </section>
  <p class="font-jetBrainMono text-center bg-base-200 pb-4 px-4">
    Special thanks to <a
      href="https://twitter.com/WeekendVisuals/status/1723463691406905722"
      class="link">Tanel</a
    >
    and
    <a
      href="https://twitter.com/iSamyadeep/status/1723823326785831180"
      class="link">Samyadeep</a
    > for the design inspiration for this landing page
  </p>
</div>

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
