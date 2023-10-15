<div align="center">
  <h1 align="center">📓 Introspecta - Beta Version</h1>
  <h3>Your Personal Web Diary App Focused on Privacy</h3>
</div>

<div align="center">
  <a href="https://introspecta.vercel.app/desktop">Try Introspecta</a>
</div>

---

Introspecta is a web diary app that prioritizes privacy and data ownership, allowing you to reflect on your life without the worry of anyone else seeing it. Continue reading to learn how this app handles your diary entries and data.

## Quick Overview

- **Secure Entries**: When you create a new diary, the app automatically generates a unique 5-word passphrase that you don't need to provide. This passphrase serves as the key to unlocking your diary entries.

- **Local Storage**: All your diary entries are securely stored in encrypted form within your browser's IndexedDB, ensuring that no data is transmitted to external servers.

- **Backup and Sync**: To prevent data loss, I offer an option to back up and sync your entries with your Google Drive account.

![Creating Diary](https://github.com/RoopkumarD/introspecta/assets/120183778/07c8359f-3efb-4992-af09-7fa33bd4945f)

## Why I Consider This App a Tool

You can essentially perform the same tasks that this app offers by creating a text file, writing entries, encrypting them using [OpenPGP](https://www.openpgp.org/), and manually backing up your content to your Google Drive account. However, I've developed this app to streamline and automate these processes.

Going forward, I will continue to steer this app in the direction of becoming a more comprehensive tool for users to effortlessly create and manage their entries.

## Tech Stack

- [Sveltekit](https://kit.svelte.dev/): Primary framework for building this app.
- [Vercel](https://vercel.com): Hosting my web app with reliability.
- [Svelte French Toast](https://svelte-french-toast.com/): Used for displaying toasts.
- [daisyui](https://daisyui.com/): Pre-built Tailwind CSS components.
- [idb-keyval](https://github.com/jakearchibald/idb-keyval): Simplified storage of entries in IndexedDB.
- [libsodium-wrappers](https://www.npmjs.com/package/libsodium-wrappers): For cryptographic APIs.
- [Google Sign-In](https://developers.google.com/identity/gsi/web/guides/overview): Secure Google account authorization.
- [Google API JavaScript Client](https://github.com/google/google-api-javascript-client): Api's helping store data in your Google Drive.
- [Msgpackr](https://github.com/kriszyp/msgpackr): To serialise data which is stored in your Drive.

## The Cryptographic and Backup System

All the magic happens within the [libsodium.ts](https://github.com/RoopkumarD/introspecta/blob/main/src/lib/libsodium.ts) file.

### Crafting an Entry

I utilize the 5 words to generate public and private key pairs. The public key is employed with the libsodium crypto seal box, which in turn creates an ephemeral secret key used to encrypt individual diary entries. The public key encrypts this secret key and appends it to the encrypted log. You can get an in-depth look into this process in the [SaveEntry.svelte](https://github.com/RoopkumarD/introspecta/blob/main/src/lib/components/Dashboard/Desktop/SaveEntry.svelte) component.

![Creating Entry](https://github.com/RoopkumarD/introspecta/assets/120183778/46ca50be-f88c-4c42-a106-537d572a249f)

### Why You Need to Enter Your Passphrase Each Time You Open the App

Every time you open the app, it's necessary to enter your passphrase. This is because all of your diary entries are securely stored in encrypted form within IndexedDB. To access and use your entries, the app needs to decrypt them. When you provide your passphrase, it generates the required public and private keys, which are then used to decrypt your entries. Once decrypted, your entries are temporarily stored in memory for you to access and use. For a deep dive into this process, explore the [EnterKey.svelte](https://github.com/RoopkumarD/introspecta/blob/main/src/lib/components/Login/EnterKey.svelte) component.

### Backup and Sync

App uses implicit flow to obtain a temporary access token, which the app needs to manage and modify data in your Google Drive storage. No worries, I've limited the access token's scope to only include files created by this app.

Additionally, since I'm utilizing the implicit flow, you'll need to grant access by accepting Google's consent form during each app session.

For a deep dive into this process, explore the [SyncEntries.svelte](https://github.com/RoopkumarD/introspecta/blob/main/src/lib/components/Dashboard/Desktop/SyncEntries.svelte) component and this file [googleDrive.ts](https://github.com/RoopkumarD/introspecta/blob/main/src/lib/googleDrive.ts).

![Syncing Backup](https://github.com/RoopkumarD/introspecta/assets/120183778/e8322fd3-c8ce-47f7-ae8b-97462ef1a6c3)

## Contribution

Introspecta is an open-source project, and I wholeheartedly welcome contributions from the community. You're encouraged to fork the repository, make your enhancements, and submit pull requests.

I genuinely value your feedback and suggestions. If you run into issues or have any ideas, please don't hesitate to open an issue or reach out to me on [Twitter](https://twitter.com/Roopkd_) or via [email](mailto:roopkumards@gmail.com).

## Parting Thoughts

Introspecta is currently in beta, and I'm eager to hear your thoughts and experiences. Feel free to make it your daily diary app, as I won't introduce any disruptive changes. Your insights and feedback are immensely appreciated as I continue to refine the app.
