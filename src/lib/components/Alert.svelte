<script lang="ts">
  let {
    title,
    message,
    onClose = $bindable(),
  } = $props<{
    title?: string;
    message?: string;
    onClose?: () => void;
  }>();
</script>

<div class="alert">
  <h2>{title}</h2>
  <p>{message}</p>
  <button onclick={onClose}>확인</button>
</div>

<style>
  .alert {
    padding: 1rem;
  }
  h2 {
    margin-top: 0;
  }
  button {
    margin-top: 1rem;
  }
</style>
