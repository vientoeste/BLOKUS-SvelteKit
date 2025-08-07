import Confirm from "$lib/components/Confirm.svelte";
import { modalStore } from "$lib/store";

type ConfirmResult = 'CONFIRM' | 'CANCEL' | 'CLOSE';

export class ConfirmManager {
  private _open({
    title,
    message,
    confirmText = 'confirm',
    cancelText = 'cancel',
  }: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
  }): Promise<ConfirmResult> {
    return new Promise<ConfirmResult>((res) => modalStore.open(Confirm, {
      title,
      message,
      confirmText,
      cancelText,
      onConfirm: () => res('CONFIRM'),
      onClose: () => res('CLOSE'),
      onCancel: () => res('CANCEL'),
    }));
  }
}

export class AlertManager {

}

export class InputManager {

}
