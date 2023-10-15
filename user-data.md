# Regarding User Data

## Introduction

Welcome to Introspecta, your personal web diary app focused on privacy. This text explains everything regarding how this app works with your entries.

## Types of Data Collected

None, I have designed this app to operate entirely on the client side without involving any data transfer to a server. You can verify this by examining the 'src' folder, where you will find that I have not created any '+server.ts' file, which is responsible for API code in a SvelteKit application.

## How Data Is Processed in the Introspecta Web App

Each entry, when created, is encrypted by a randomly generated secret key. The encrypted entry is stored in your browser's IndexedDB storage, ensuring that all entries remain in encrypted form.

To access your data, users are required to decrypt it each time they open the app by going through the unlock diary process.

Users can also back up their data to their Google Drive account storage, and the data that is backed up is also in encrypted form.

## Data Sharing

Since i do not collect any user data, i do not have the capability to share it with any third-party service.

## Cookies and Tracking

This app currently utilizes third-party Google cookies for authorization. I will soon replace this with 'fedcm.'

## Changes to the Policy Regarding Data

If I update any rules or policies, I will notify you (users) within the app itself.

## Contact Information

If you have questions or concerns about your data or this app's privacy policy, please contact me at roopkumards@gmail.com.

## Parting Thoughts

Introspecta is currently in beta, and I'm eager to hear your thoughts and experiences. Feel free to make it your daily diary app, as I won't introduce any disruptive changes. Your insights and feedback are immensely appreciated as I continue to refine the app.
