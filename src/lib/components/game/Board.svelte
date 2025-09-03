<script lang="ts">
  import { boardStore } from "$lib/store";
  import RowContainer from "./RowContainer.svelte";
</script>

<div id="board">
  {#each $boardStore as boardRow}
    <div class="board__row">
      <RowContainer columns={boardRow}></RowContainer>
    </div>
  {/each}
</div>

<style>
  #board {
    display: flex;
    flex-direction: column;
  }

  .board__row + .board__row {
    margin-top: -1px;
  }
</style>
