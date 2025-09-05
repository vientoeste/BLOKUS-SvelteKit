<script lang="ts">
  import RowContainer from "../RowContainer.svelte";
  const { color } = $props();

  let block = $state([
    [color, -1, -1],
    [color, color, color],
    [-1, color, -1],
  ]);
</script>

<div class="block">
  {#each block as blockRow}
    <div class="block__row">
      <RowContainer columns={blockRow}></RowContainer>
    </div>
  {/each}
</div>

<style>
  .block__row + .block__row {
    margin-top: -1px;
  }
</style>
