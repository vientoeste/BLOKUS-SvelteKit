<script lang="ts">
  import type { BoardMatrix } from "$types";
  import type { Readable } from "svelte/store";

  let boardElement: HTMLElement;

  let {
    source,
    handleDragOver,
    handleDrop,
  }: {
    source: Readable<BoardMatrix> | undefined;
    handleDragOver:
      | undefined
      | ((e: DragEvent, boardElement: HTMLElement) => void);
    handleDrop: undefined | ((e: DragEvent, boardElement: HTMLElement) => void);
  } = $props();
</script>

<div class="board" bind:this={boardElement}>
  {#each $source as boardLine, rowIdx}
    <div id="boardLine-{rowIdx}" class="boardLine">
      {#each boardLine as cell, colIdx}
        <div class="cell-cover">
          <div
            id="cell-{rowIdx}-{colIdx}"
            class="cell cell-{cell}"
            role="button"
            tabindex="0"
            ondragover={(e) => {
              handleDragOver?.(e, boardElement);
            }}
            ondrop={(e) => {
              handleDrop?.(e, boardElement);
            }}
          ></div>
        </div>
      {/each}
    </div>
  {/each}
</div>

<style>
  .board {
    width: fit-content;
    height: fit-content;
    background: white;
    border: 0.5px solid black;
  }
  .boardLine {
    display: flex;
    flex-direction: row;
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
  #boardLine-19 > .cell-cover {
    border-bottom: none;
  }
  .cell {
    width: 30px;
    height: 30px;
    background: rgb(185, 185, 185);
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
  .highlighted {
    /* change to other color */
    background: black !important;
  }
</style>
