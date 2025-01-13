<script lang="ts">
  import { gameStore } from "../../Store";

  const { block } = $props();
</script>

<div class="block-container">
  {#each block as blockLine}
    <div class="row-layout">
      {#each blockLine as cell}
        <div
          class="cell-cover
            {cell?.u ? 'border-top' : ''}
            {cell?.r ? 'border-right' : ''}
            {cell?.b ? 'border-bottom' : ''}
            {cell?.l ? 'border-left' : ''}
            {cell === null ? 'cell-blank' : ''}
            "
        >
          <div
            class="cell
            cell-{cell === null ? 'blank' : $gameStore.playerIdx}
            "
          ></div>
        </div>
      {/each}
    </div>
  {/each}
</div>

<style>
  .block-container {
    width: fit-content;
    height: fit-content;
    background: rgba(0, 0, 0, 0);
    /* padding: 5px 0; */
    /* border: 0.5px solid black; */
  }
  .cell-cover {
    background: white;
    padding: 1px;
    border-left: 0.5px solid rgba(0, 0, 0, 0.267);
    border-bottom: 0.5px solid rgba(0, 0, 0, 0.267);
  }
  .cell-cover:first-child {
    border-left: none;
  }
  .cell {
    width: 30px;
    height: 30px;
    background: rgb(185, 185, 185);
  }
  .cell-blank {
    background: rgba(0, 0, 0, 0);
    border-left: 1px solid rgba(255, 255, 255, 0) !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0) !important;
  }
  .cell-0 {
    background: rgba(0, 0, 255, 0.625);
  }
  .cell-1 {
    background: rgba(255, 0, 0, 0.65);
  }
  .cell-2 {
    background: rgb(0, 220, 0, 0.625);
  }
  .cell-3 {
    background: rgb(255, 255, 0, 0.75);
  }

  .border-top {
    border-top: 0.5px solid black !important;
  }
  .border-left,
  .border-left .cell-blank {
    border-left: 0.5px solid black !important;
  }
  .border-right {
    border-right: 0.5px solid black !important;
  }
  .border-bottom,
  .border-bottom .cell-blank {
    border-bottom: 0.5px solid black !important;
  }
</style>
