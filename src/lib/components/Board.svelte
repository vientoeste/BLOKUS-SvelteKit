<script lang="ts">
  import type { BlockMatrix, BlockType } from "$lib/types";
  import { parseJson } from "$lib/utils";
  import {
    draggedBlockMatrixStore,
    dragPositionOffsetStore,
  } from "../../Store";

  const { board, relayMove } = $props();

  let boardElement: HTMLElement;
  const cellElements: HTMLElement[][] = Array(20)
    .fill([])
    .map(() => Array(20).fill({} as HTMLElement));

  class CellHighlightManager {
    // [TODO] implement this class for optimization:
    // manipulate highlighted elements by sliding-window
    // if I do this rn, it will be, must be an early-optimization
  }

  const highlightedCells: HTMLElement[] = [];
  let lock = false;
  function unhighlightCells() {
    if (!lock) {
      lock = true;
      const length = highlightedCells.length;
      for (let i = 0; i < length; i += 1) {
        const cell = highlightedCells.shift();
        cell?.classList?.remove("highlighted");
      }
      lock = false;
      return;
    }
    unhighlightCells();
  }
  function highlightCells({
    block,
    position,
  }: {
    block: BlockMatrix;
    position: number[];
  }) {
    unhighlightCells();
    if (
      position[0] > -1 &&
      position[0] < 20 &&
      position[1] > -1 &&
      position[1] < 20
    ) {
      block.forEach((blockLine, rowIdx) => {
        blockLine.forEach((cell, colIdx) => {
          if (cell !== null) {
            const currentCell =
              cellElements[position[0] + rowIdx][position[1] + colIdx];
            highlightedCells.push(currentCell);
            currentCell.classList.add("highlighted");
          }
        });
      });
    }
  }

  function getPosition({ x, y }: { x: number; y: number }) {
    const { left: boardLeft, top: boardTop } =
      boardElement.getBoundingClientRect();
    return [
      Math.ceil((y + $dragPositionOffsetStore[1] - boardTop) / 33) - 1,
      Math.ceil((x + $dragPositionOffsetStore[0] - boardLeft) / 33) - 1,
    ];
  }

  function handleDragOver(e: DragEvent, rowIdx: number, colIdx: number) {
    e.preventDefault();
    // getPosition();
    highlightCells({
      block: $draggedBlockMatrixStore,
      position: getPosition({ x: e.clientX, y: e.clientY }),
    });
  }

  function handleDrop(e: DragEvent, rowIdx: number, colIdx: number) {
    e.preventDefault();

    dragPositionOffsetStore.set([0, 0]);
    highlightedCells.forEach((e) => {
      e.classList.remove("highlighted");
    });
    highlightedCells.length = 0;

    try {
      // [TODO] extend dataTrasfer's data to contain rotate, flip, ...
      if (e.dataTransfer) {
        const data = parseJson<{ type: BlockType }>(
          e.dataTransfer.getData("application/json"),
        );
        if (typeof data === "string") {
          return;
        }

        relayMove("blockDrop", {
          position: getPosition({ x: e.clientX, y: e.clientY }),
          blockType: data.type,
        });

        unhighlightCells();
      }
    } catch (error) {
      console.error("Drop 처리 중 에러:", error);
    }
  }
</script>

<div id="board" bind:this={boardElement}>
  {#each board as boardLine, rowIdx}
    <div id="boardLine-{rowIdx}" class="boardLine">
      {#each boardLine as cell, colIdx}
        <div class="cell-cover">
          <div
            id="cell-{rowIdx}-{colIdx}"
            class="cell cell-{cell}"
            role="button"
            tabindex="0"
            bind:this={cellElements[rowIdx][colIdx]}
            ondragover={(e) => {
              handleDragOver(e, rowIdx, colIdx);
            }}
            ondrop={(e) => {
              handleDrop(e, rowIdx, colIdx);
            }}
          ></div>
        </div>
      {/each}
    </div>
  {/each}
</div>

<style>
  #board {
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
