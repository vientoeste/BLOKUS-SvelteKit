<script lang="ts">
  import RowContainer from "./RowContainer.svelte";

  const { blockMatrix, color } = $props();
</script>

<div class="block">
  {#each blockMatrix as blockRow}
    <div class="block__row">
      <RowContainer columns={blockRow} />
    </div>
  {/each}
</div>

<style>
  .block__row + .block__row {
    margin-top: -1px;
  }
</style>
