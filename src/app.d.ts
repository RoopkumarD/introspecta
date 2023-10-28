// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

/// <reference path="./google-window.d.ts" />

// types from https://github.com/wavezync/vue3-google-signin/blob/main/src/%40types/globals.ts
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface Platform {}
  }

  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (input: IdConfiguration) => void;
          prompt: (momentListener?: MomenListener) => void;
          renderButton: (
            parent: HTMLElement,
            options: GsiButtonConfiguration,
          ) => void;
          disableAutoSelect: () => void;
          storeCredential: (
            credential: { id: string; password: string },
            callback?: () => void,
          ) => void;
          cancel: () => void;
          onGoogleLibraryLoad: Function;
          revoke: (accessToken: string, done: () => void) => void;
        };
        oauth2: {
          initTokenClient: (config: TokenClientConfig) => {
            requestAccessToken: (
              overridableClientConfig?: OverridableTokenClientConfig,
            ) => void;
          };
          initCodeClient: (config: CodeClientConfig) => {
            requestCode: () => void;
          };
          hasGrantedAnyScope: (
            tokenRsponse: TokenResponse,
            firstScope: string,
            ...restScopes: string[]
          ) => boolean;
          hasGrantedAllScopes: (
            tokenRsponse: TokenResponse,
            firstScope: string,
            ...restScopes: string[]
          ) => boolean;
          revoke: (accessToken: string, done?: () => void) => void;
        };
      };
    };
  }
}

export { };
