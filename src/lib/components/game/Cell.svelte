<script lang="ts">
  const { color } = $props<{
    color: "none" | "blue" | "red" | "green" | "yellow" | "spacing";
  }>();
</script>

{#if color !== "spacing"}
  <div class="cell-cover">
    <div class="cell-blank">
      <div class="cell-content" style="background-color: var(--{color});">
        &nbsp;
      </div>
    </div>
  </div>
{:else}
  <div class="spacing-cell">&nbsp;</div>
{/if}

<style>
  .cell-cover {
    background-color: var(--none);
    padding: 1px;
    pointer-events: auto;
  }

  .cell-blank {
    background-color: #fff;
    padding: 1px;
  }

  .cell-content {
    height: var(--block-size);
    width: var(--block-size);
  }

  .spacing-cell {
    height: calc(var(--block-size) + 4px);
    width: calc(var(--block-size) + 4px);
    opacity: 0%;
    pointer-events: none;
  }
</style>
