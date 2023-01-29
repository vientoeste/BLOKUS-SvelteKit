<script lang="ts">
  let show = false;
  let message: string = "";

  export function open(this: { message: string }, message: string) {
    show = true;
    this.message = message;
  }
  export const close = () => {
    show = false;
  };
</script>

{#if show}
  <div class="modal show">
    <div class="modal-content">
      <p>{message}</p>
      <button on:click={close}>Close</button>
    </div>
  </div>
{/if}

<style>
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(0, 0, 0, 0.5);
    visibility: hidden;
    opacity: 0;
    transition: all 0.3s ease-in-out;
  }
  .modal.show {
    visibility: visible;
    opacity: 1;
  }
  .modal-content {
    background: #fff;
    padding: 1rem;
    border-radius: 5px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.25);
  }
</style>
