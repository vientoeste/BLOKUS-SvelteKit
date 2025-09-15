<script lang="ts">
  import type { ColorValue } from "$types/client/ui";

  let { color }: { color: ColorValue } = $props();
</script>

{#if color !== "SPACING"}
  <div class="cell-cover">
    <div class="cell-blank">
      <div
        class="cell-content"
        style="background-color: var(--{color.toLowerCase()});"
      ></div>
    </div>
  </div>
{:else}
  <div class="spacing-cell"></div>
{/if}

<style>
  .cell-cover {
    background-color: var(--none);
    padding: 1px;
    pointer-events: none;
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
