<script lang="ts">
  import { onMount } from "svelte";

  let {
    title = $bindable(),
    message = $bindable(),
    confirmText = $bindable("Confirm"),
    cancelText = $bindable("Cancel"),
    onConfirm = $bindable(() => {}),
    onCancel = $bindable(() => {}),
    onClose = $bindable(() => {}),
  }: {
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    onClose?: () => void;
  } = $props();

  function handleConfirm() {
    onConfirm?.();
    onClose?.();
  }

  function handleCancel() {
    onCancel?.();
    onClose?.();
  }

  onMount(() => {
    setTimeout(() => {
      confirmButton?.focus();
    }, 1);
  });

  let confirmButton: HTMLButtonElement;
</script>

<div class="confirm-dialog">
  <div class="confirm-header">
    <h2>{title}</h2>
  </div>

  <div class="confirm-content">
    {@html message}
  </div>

  <div class="confirm-actions">
    <button class="cancel-button" onclick={handleCancel}>
      {cancelText}
    </button>
    <button
      class="confirm-button"
      onclick={handleConfirm}
      bind:this={confirmButton}
    >
      {confirmText}
    </button>
  </div>
</div>

<style>
</style>
