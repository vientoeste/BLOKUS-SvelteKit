<script lang="ts">
  import { colorMapper } from "$lib/utils";
  import type { RawColor } from "$types/client/ui";
  import Cell from "./Cell.svelte";

  let { matrix, id }: { matrix: RawColor[][]; id: string } = $props();
</script>

<div {id} class="matrix">
  {#each matrix as row}
    <div class="matrix__row">
      {#each row as cell}
        <div class="matrix_cell">
          <Cell color={colorMapper(cell)}></Cell>
        </div>
      {/each}
    </div>
  {/each}
</div>

<style>
  .matrix__row + .matrix__row {
    margin-top: -1px;
  }
  .matrix__row {
    display: flex;
    flex-direction: row;
  }
  .matrix_cell + .matrix_cell {
    margin-left: -1px;
  }
</style>
