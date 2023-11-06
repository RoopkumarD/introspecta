<!-- 
https://codepen.io/mupkoo/pen/YgddgB
Thanks to this great person, that i don't have to do all these
-->

<script lang="ts">
  export let getAccessToken: () => Promise<void>,
    disabled: boolean = false;
</script>

<button
  type="button"
  class="login-with-google-btn relative"
  {disabled}
  on:click={getAccessToken}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="absolute top-[11px] left-[12px]"
    width="18"
    height="18"
    ><g fill="none" fill-rule="evenodd"
      ><path
        d="M17.6 9.2l-.1-1.8H9v3.4h4.8C13.6 12 13 13 12 13.6v2.2h3a8.8 8.8 0 0 0 2.6-6.6z"
        fill="#4285F4"
        fill-rule="nonzero"
      /><path
        d="M9 18c2.4 0 4.5-.8 6-2.2l-3-2.2a5.4 5.4 0 0 1-8-2.9H1V13a9 9 0 0 0 8 5z"
        fill="#34A853"
        fill-rule="nonzero"
      /><path
        d="M4 10.7a5.4 5.4 0 0 1 0-3.4V5H1a9 9 0 0 0 0 8l3-2.3z"
        fill="#FBBC05"
        fill-rule="nonzero"
      /><path
        d="M9 3.6c1.3 0 2.5.4 3.4 1.3L15 2.3A9 9 0 0 0 1 5l3 2.4a5.4 5.4 0 0 1 5-3.7z"
        fill="#EA4335"
        fill-rule="nonzero"
      /><path d="M0 0h18v18H0z" /></g
    ></svg
  >
  Sign in with Google
</button>

<style>
  .login-with-google-btn {
    transition: background-color 0.3s, box-shadow 0.3s;
    padding: 12px 16px 12px 42px;
    border: none;
    border-radius: 3px;
    box-shadow: 0 -1px 0 rgba(0, 0, 0, 0.04), 0 1px 1px rgba(0, 0, 0, 0.25);
    color: #757575;
    font-size: 14px;
    font-weight: 500;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
    background-color: white;
  }
  .login-with-google-btn:hover {
    box-shadow: 0 -1px 0 rgba(0, 0, 0, 0.04), 0 2px 4px rgba(0, 0, 0, 0.25);
  }
  .login-with-google-btn:active {
    background-color: #eeeeee;
  }
  .login-with-google-btn:focus {
    outline: none;
    box-shadow: 0 -1px 0 rgba(0, 0, 0, 0.04), 0 2px 4px rgba(0, 0, 0, 0.25),
      0 0 0 3px #c8dafc;
  }
  .login-with-google-btn:disabled {
    filter: grayscale(100%);
    background-color: #ebebeb;
    box-shadow: 0 -1px 0 rgba(0, 0, 0, 0.04), 0 1px 1px rgba(0, 0, 0, 0.25);
    cursor: not-allowed;
  }
</style>
