import { writable } from "svelte/store";

export const showModal = writable<boolean>(false);

interface WarningValues {
  title: string;
  content: string;
  buttonString: string;
  action: (permissionGiven: boolean) => void;
}

export const warningValues = writable<WarningValues>({
  title: "",
  content: "",
  buttonString: "",
  action: (permissionGiven: boolean) => { },
});

export function openWarningModal(val: WarningValues) {
  warningValues.set(val);
  showModal.set(true);
  return;
}
