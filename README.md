# Introspecta - Beta

Introspecta is a tool/platform that allows you to journal your life with complete privacy, and the best part is, it's entirely free! This app doesn't store your logs in the cloud, nor does it ask for your email (except during the backup process, as explained in the "Backing Up" section).

Think of this app as a digital diary with a lock and key. When you create an account, you receive a set of passphrases that you'll use to access your journal every time you visit the app. These same passphrases encrypt all your entries, and I don't store them anywhere. If you lose them, I won't be able to help you recover your keys. This app provides a safe haven where your entries remain confidential, even from me.

![thumbnail](https://github.com/RoopkumarD/introspecta/assets/120183778/4f612466-7094-4b98-87b0-188d3af4200d)

## Getting Started

When you first visit the app, you'll encounter an "Enter Key" screen. This is where you provide the key to unlock your diary. Since you don't have account, you can click on "Create a New Account," and there you'll see that it generates five words to serve as your passphrase. This passphrase encrypts all your logs.

## Entry Writer

You can create, edit, and delete your diary entries, just like you would with other apps. Additionally, this app offers a feature to organize entries into different journals. You can create as many journals as you want, and there's no charge for it.

## Where Are My Entries Stored?

Your diary entries are stored directly in your browser, which means you don't have to wait long for decryption because I'm not fetching them from the cloud. However, you may be concerned that browser data is vulnerable to accidental deletion, and you may want to access your diary from multiple devices.

## Backup?

That's why I'm working on a feature to save all your encrypted entries to your Google Drive account. This way, you won't have to trust me with your data, and it'll be entirely secure within your Google account (unless Google decides to discontinue Google Drive, which is highly unlikely). While I'm still implementing this feature, you can explore how the app feels and functions.

In summary, I'd like to emphasize that this online diary is different from platforms like Day One, where it handle everything. This web app is simply a tool that empowers you to write your diary, automatically encrypts the data, and backs it up to your Google Drive without you needing to understand the technical details. Your role is to create entries and let the app do the rest.

![3](https://github.com/RoopkumarD/introspecta/assets/120183778/e8322fd3-c8ce-47f7-ae8b-97462ef1a6c3)
![1](https://github.com/RoopkumarD/introspecta/assets/120183778/07c8359f-3efb-4992-af09-7fa33bd4945f)
![2](https://github.com/RoopkumarD/introspecta/assets/120183778/46ca50be-f88c-4c42-a106-537d572a249f)



## Thanks to These Projects That Made This Web App Possible

- [Sveltekit](https://kit.svelte.dev/) - The primary framework used to create this app
- [Svelte french toast](https://svelte-french-toast.com/) - Used for displaying toasts
- [Comlink](https://github.com/GoogleChromeLabs/comlink) - Employed for communication with web workers (because I don't enjoy working with message events)
- [idb-keyval](https://github.com/jakearchibald/idb-keyval) - Simplified storage of entries in IndexedDB
- [libsodium-wrappers](https://www.npmjs.com/package/libsodium-wrappers) - Provides cryptographic APIs
- [daisyui](https://daisyui.com/) - Pre-built Tailwind CSS components

## The Complete Cryptographic System Used in This App

Coming soon...


## Final Words

I haven't officially released the web app yet because I'm still working on implementing the backup system. However, you can check out the app by cloning it and let me know your thoughts. If you find the UI less than impressive, don't hesitate to tell me directly via DM ([twitter](https://twitter.com/Roopkd_) or [email](mailto:roopkumards@gmail.com)) or open an issue. I'm committed to improving this app, and your feedback is highly valuable.
