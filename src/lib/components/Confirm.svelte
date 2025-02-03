<script lang="ts">
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
</script>

<div class="confirm-dialog">
  <div class="confirm-header">
    <h2>{title}</h2>
  </div>

  <div class="confirm-content">
    <p>{message}</p>
  </div>

  <div class="confirm-actions">
    <button class="cancel-button" onclick={handleCancel}>
      {cancelText}
    </button>
    <button class="confirm-button" onclick={handleConfirm}>
      {confirmText}
    </button>
  </div>
</div>

<style>
</style>
