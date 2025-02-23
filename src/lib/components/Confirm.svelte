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
  .confirm-actions {
    display: flex;
    gap: 0.75rem;
  }

  @media (min-width: 768px) {
    .confirm-actions {
      justify-content: flex-end;
    }

    .confirm-button,
    .cancel-button {
      min-width: 6rem;
      min-height: 2.4rem;
    }
  }

  @media (max-width: 767px) {
    .confirm-actions {
      flex-direction: column;
    }

    .confirm-button,
    .cancel-button {
      width: 100%;
      padding: 0.75rem;
    }
  }

  .confirm-dialog {
    padding: 5px;
    min-width: 300px;
    background-color: light-dark(#ffffff, #2a2a2a);
  }

  .confirm-header {
    margin-bottom: 1rem;
    text-align: center;
  }

  .confirm-header h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: light-dark(#1a1a1a, #e5e5e5);
  }

  .confirm-content {
    margin-bottom: 1.5rem;
    color: light-dark(#4a4a4a, #b0b0b0);
    line-height: 1.5;
    display: flex;
    justify-content: center;
  }

  .confirm-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
  }

  .confirm-button,
  .cancel-button {
    padding: 0.5rem 1rem;
    border-radius: 2px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .confirm-button {
    background-color: light-dark(#3b82f6, #60a5fa);
    color: light-dark(#ffffff, #1a1a1a);
    border: none;
  }

  .confirm-button:hover {
    background-color: light-dark(#2563eb, #93c5fd);
  }

  .cancel-button {
    background-color: light-dark(#f3f4f6, #374151);
    color: light-dark(#4b5563, #d1d5db);
    border: 1px solid light-dark(#e5e7eb, #4b5563);
  }

  .cancel-button:hover {
    background-color: light-dark(#e5e7eb, #4b5563);
  }

  .confirm-button:focus,
  .cancel-button:focus {
    outline: 2px solid light-dark(#3b82f6, #60a5fa);
    outline-offset: 2px;
  }

  .confirm-button:disabled,
  .cancel-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
