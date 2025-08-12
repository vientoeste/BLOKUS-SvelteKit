import Alert from "$lib/components/Alert.svelte";
import Confirm from "$lib/components/Confirm.svelte";
import { modalStore } from "$lib/store";

type ConfirmResult = 'CONFIRM' | 'CANCEL' | 'CLOSE';

export class ConfirmManager {
  private async _open({
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

  async openMoveConfirmModal(imgUrl: string): Promise<ConfirmResult> {
    return this._open({
      title: 'confirm your move',
      message: `<img src="${imgUrl}" alt="board preview" style="max-width: 100%;" />`,
    });
  }
}

export class AlertManager {
  // [TODO] add cancelText to Alert modal
  private async _open({
    title,
    message,
    // cancelText = 'cancel',
  }: {
    title: string;
    message: string;
    // cancelText?: string;
  }): Promise<void> {
    return new Promise<void>((res) => modalStore.open(Alert, {
      title,
      message,
      // cancelText,
      onClose: () => res(),
    }));
  }
}

export class InputManager {

}
