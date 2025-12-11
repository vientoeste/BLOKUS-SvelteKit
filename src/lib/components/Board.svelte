<script lang="ts">
  import { getBlockMatrix } from "$lib/game/core";
  import type { Block, BlockMatrix, SlotIdx } from "$types";
  import { dragPositionOffsetStore, moveStore } from "$lib/store";
  import html2canvas from "html2canvas";
  import { useGame } from "$lib/client/game/context";
  import BoardMatrixRenderer from "./BoardMatrixRenderer.svelte";

  const {
    submitMove,
  }: {
    submitMove: (param: {
      position: [number, number];
      blockInfo: Block;
      slotIdx: SlotIdx;
    }) => void;
  } = $props();

  const { state } = useGame();
  const boardStore = $state?.board.matrix;

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
    boardElement,
  }: {
    block: BlockMatrix;
    position: number[];
    boardElement: HTMLElement;
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
          if (cell) {
            const currentCell = boardElement.children[position[0] + rowIdx]
              .children[position[1] + colIdx].children[0] as HTMLElement;
            highlightedCells.push(currentCell);
            currentCell.classList.add("highlighted");
          }
        });
      });
    }
  }

  function getPosition({
    x,
    y,
    boardElement,
  }: {
    x: number;
    y: number;
    boardElement: HTMLElement;
  }): [number, number] {
    const { left: boardLeft, top: boardTop } =
      boardElement.getBoundingClientRect();
    return [
      Math.ceil((y + $dragPositionOffsetStore[1] - boardTop) / 33) - 1,
      Math.ceil((x + $dragPositionOffsetStore[0] - boardLeft) / 33) - 1,
    ];
  }

  function handleDragOver(e: DragEvent, boardElement: HTMLElement) {
    e.preventDefault();
    if ($moveStore === null) return;
    highlightCells({
      block: getBlockMatrix($moveStore),
      position: getPosition({ x: e.clientX, y: e.clientY, boardElement }),
      boardElement,
    });
  }

  async function handleDrop(e: DragEvent, boardElement: HTMLElement) {
    e.preventDefault();

    const position = getPosition({ x: e.clientX, y: e.clientY, boardElement });

    dragPositionOffsetStore.set([0, 0]);
    highlightedCells.forEach((e) => {
      e.classList.remove("highlighted");
    });
    highlightedCells.length = 0;

    try {
      if ($moveStore === null) throw new Error("move store is empty");
      const { type, rotation, flip, slotIdx } = $moveStore;
      if (type === undefined || rotation === undefined || flip === undefined) {
        throw new Error("missing blockInfo");
      }

      submitMove({
        position,
        blockInfo: { type, rotation, flip },
        slotIdx,
      });
      unhighlightCells();
    } catch (error) {
      console.error("DnD(drop):", error);
    }
  }

  async function capturePartialBoard(
    block: BlockMatrix,
    position: [number, number],
    slotIdx: SlotIdx,
    boardElement: HTMLElement,
  ): Promise<string> {
    const blockHeight = block.length;
    const blockWidth = block[0].length;

    const startRow = Math.max(0, position[0] - 2);
    const startCol = Math.max(0, position[1] - 2);
    const endRow = Math.min(19, position[0] + blockHeight + 1);
    const endCol = Math.min(19, position[1] + blockWidth + 1);

    const tempDiv = document.createElement("div");
    tempDiv.style.position = "absolute";
    tempDiv.style.left = "-9999px";

    const partialBoard = document.createElement("div");
    partialBoard.style.display = "flex";
    partialBoard.style.flexDirection = "column";

    for (let i = startRow; i <= endRow; i += 1) {
      const row = document.createElement("div");
      row.style.display = "flex";

      for (let j = startCol; j <= endCol; j += 1) {
        const originalCell = boardElement.children[i].children[j].cloneNode(
          true,
        ) as HTMLElement;
        if (
          i >= position[0] &&
          i < position[0] + blockHeight &&
          j >= position[1] &&
          j < position[1] + blockWidth &&
          block[i - position[0]][j - position[1]]
        ) {
          originalCell.children[0].classList.add(`cell-${slotIdx}`);
        }
        row.appendChild(originalCell);
      }

      partialBoard.appendChild(row);
    }

    tempDiv.appendChild(partialBoard);
    document.body.appendChild(tempDiv);

    const canvas = await html2canvas(partialBoard);
    const image = canvas.toDataURL();
    document.body.removeChild(tempDiv);
    return image;
  }
</script>

<BoardMatrixRenderer source={boardStore} {handleDragOver} {handleDrop} />
