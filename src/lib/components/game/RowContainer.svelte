<script lang="ts">
  import { colorMapper } from "$lib/utils";
  import Cell from "./Cell.svelte";

  const { columns } = $props<{ columns: (false | number)[] }>();
</script>

<div class="row">
  {#each columns as column}
    <div class="row__cell">
      <Cell color={colorMapper(column)}></Cell>
    </div>
  {/each}
</div>

<style>
  .row {
    display: flex;
    flex-direction: row;
  }

  .row__cell + .row__cell {
    margin-left: -1px;
  }
</style>
