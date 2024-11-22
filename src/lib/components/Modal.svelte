<script lang="ts">
  import { modalStore } from "../../Store";

  let { showModal = $bindable() } = $props();

  let dialog = $state<HTMLDialogElement>();

  $effect(() => {
    if ($modalStore.isOpen && dialog) {
      dialog.showModal();
    }
  });

  function closeModal() {
    dialog?.close();
    modalStore.close();
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<dialog
  bind:this={dialog}
  onclose={() => (showModal = false)}
  onclick={(e) => {
    if (e.target === dialog) dialog.close();
  }}
>
  <!-- svelte-ignore svelte_component_deprecated -->
  <div class="modal-content">
    {#if $modalStore.component}
      <svelte:component
        this={$modalStore.component}
        {...$modalStore.props}
        onClose={closeModal}
      />
    {/if}
  </div>
</dialog>

<style>
  dialog {
    max-width: 32em;
    max-height: 90vh;
    border-radius: 0.2em;
    border: none;
    padding: 0;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    margin: 0;
    overflow-y: auto;
  }

  .modal-content {
    padding: 1em;
    overflow: hidden;
  }

  dialog::backdrop {
    background: rgba(0, 0, 0, 0.3);
  }

  dialog > div {
    padding: 1em;
  }

  dialog[open] {
    animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes zoom {
    from {
      transform: scale(0.95);
    }
    to {
      transform: scale(1);
    }
  }

  dialog[open]::backdrop {
    animation: fade 0.2s ease-out;
  }

  @keyframes fade {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  /* [TODO] button of modal's style */
</style>
