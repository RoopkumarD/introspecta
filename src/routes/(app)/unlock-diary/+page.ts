import type { PageLoad } from "./$types";

export const load: PageLoad = () => {
  const lsPubKey = localStorage.getItem("pubKey");

  return {
    diaryExists: lsPubKey ? true : false,
    pubKeyLocal: lsPubKey,
  };
};
