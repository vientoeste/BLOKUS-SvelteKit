<script lang="ts">
  import type { BlockMatrix, BlockType } from "$types";
  import { gameStore } from "../../Store";
  import DraggableBlock from "./DraggableBlock.svelte";

  let { slotIdx }: { slotIdx: number } = $props();

  /**
   * by update key, force re-rendering of blocks container
   */
  let key = $state(0);
  gameStore.subscribe(() => {
    key += 1;
  });

  let blocks = $state($gameStore.availableBlocksBySlots[slotIdx]);
  // [TODO] refactor to display blocks based on blockState
  let blockState: Map<BlockType, { rotation: number; flip: boolean }> = $state(
    new Map(),
  );

  const preset: Record<
    BlockType,
    ({ u: boolean; r: boolean; b: boolean; l: boolean } | null)[][]
  > = {
    "10": [[{ u: true, l: true, b: true, r: true }]],
    "20": [
      [
        { u: true, l: true, b: true, r: false },
        { u: true, l: false, b: true, r: true },
      ],
    ],
    "30": [
      [
        { u: true, l: true, b: true, r: false },
        { u: true, l: false, b: true, r: false },
        { u: true, l: false, b: true, r: true },
      ],
    ],
    "31": [
      [
        { u: true, l: true, b: false, r: false },
        { u: true, l: false, b: true, r: true },
      ],
      [{ u: false, l: true, b: true, r: true }, null],
    ],
    "40": [
      [
        { u: true, l: true, b: true, r: false },
        { u: true, l: false, b: true, r: false },
        { u: true, l: false, b: true, r: false },
        { u: true, l: false, b: true, r: true },
      ],
    ],
    "41": [
      [
        { u: true, l: true, b: false, r: false },
        { u: true, l: false, b: true, r: false },
        { u: true, l: false, b: true, r: true },
      ],
      [{ u: false, l: true, b: true, r: true }, null, null],
    ],
    "42": [
      [
        { u: true, l: true, b: true, r: false },
        { u: true, l: false, b: false, r: false },
        { u: true, l: false, b: true, r: true },
      ],
      [null, { u: false, l: true, b: true, r: true }, null],
    ],
    "43": [
      [
        { u: true, l: true, b: true, r: false },
        { u: true, l: false, b: false, r: true },
        null,
      ],
      [
        null,
        { u: false, l: true, b: true, r: false },
        { u: true, l: false, b: true, r: true },
      ],
    ],
    "44": [
      [
        { u: true, l: true, b: false, r: false },
        { u: true, l: false, b: false, r: true },
      ],
      [
        { u: false, l: true, b: true, r: false },
        { u: false, l: false, b: true, r: true },
      ],
    ],
    "50": [
      [
        { u: true, l: true, b: true, r: false },
        { u: true, l: false, b: true, r: false },
        { u: true, l: false, b: true, r: false },
        { u: true, l: false, b: true, r: false },
        { u: true, l: false, b: true, r: true },
      ],
    ],
    "51": [
      [
        { u: true, l: true, b: false, r: false },
        { u: true, l: false, b: true, r: false },
        { u: true, l: false, b: true, r: true },
      ],
      [{ u: false, l: true, b: false, r: true }, null, null],
      [{ u: false, l: true, b: true, r: true }, null, null],
    ],
    "52": [
      [null, { u: true, l: true, b: false, r: true }, null],
      [
        { u: true, l: true, b: true, r: false },
        { u: false, l: false, b: false, r: false },
        { u: true, l: false, b: true, r: true },
      ],
      [null, { u: false, l: true, b: true, r: true }, null],
    ],
    "53": [
      [null, null, { u: true, l: true, b: false, r: true }],
      [
        null,
        { u: true, l: true, b: false, r: false },
        { u: false, l: false, b: true, r: true },
      ],
      [
        { u: true, l: true, b: true, r: false },
        { u: false, l: false, b: true, r: true },
        null,
      ],
    ],
    "54": [
      [{ u: true, l: true, b: false, r: true }, null, null],
      [
        { u: false, l: true, b: true, r: false },
        { u: true, l: false, b: false, r: false },
        { u: true, l: false, b: true, r: true },
      ],
      [null, { u: false, l: true, b: true, r: true }, null],
    ],
    "55": [
      [
        { u: true, l: true, b: true, r: false },
        { u: true, l: false, b: false, r: false },
        { u: true, l: false, b: true, r: true },
      ],
      [null, { u: false, l: true, b: false, r: true }, null],
      [null, { u: false, l: true, b: true, r: true }, null],
    ],
    "56": [
      [
        { u: true, l: true, b: false, r: false },
        { u: true, l: false, b: true, r: false },
        { u: true, l: false, b: true, r: false },
        { u: true, l: false, b: true, r: true },
      ],
      [{ u: false, l: true, b: true, r: true }, null, null, null],
    ],
    "57": [
      [null, null, { u: true, l: true, b: false, r: true }],
      [
        { u: true, l: true, b: false, r: false },
        { u: true, l: false, b: true, r: false },
        { u: false, l: false, b: true, r: true },
      ],
      [{ u: false, l: true, b: true, r: true }, null, null],
    ],
    "58": [
      [{ u: true, l: true, b: false, r: true }, null],
      [
        { u: false, l: true, b: false, r: false },
        { u: true, l: false, b: false, r: true },
      ],
      [
        { u: false, l: true, b: true, r: false },
        { u: false, l: false, b: true, r: true },
      ],
    ],
    "59": [
      [
        { u: true, l: true, b: true, r: false },
        { u: true, l: false, b: false, r: true },
        null,
        null,
      ],
      [
        null,
        { u: false, l: true, b: true, r: false },
        { u: true, l: false, b: true, r: false },
        { u: true, l: false, b: true, r: true },
      ],
    ],
    "5a": [
      [
        { u: true, l: true, b: false, r: false },
        { u: true, l: false, b: true, r: true },
      ],
      [{ u: false, l: true, b: false, r: true }, null],
      [
        { u: false, l: true, b: true, r: false },
        { u: true, l: false, b: true, r: true },
      ],
    ],
    "5b": [
      [null, { u: true, l: true, b: false, r: true }, null, null],
      [
        { u: true, l: true, b: true, r: false },
        { u: false, l: false, b: true, r: false },
        { u: true, l: false, b: true, r: false },
        { u: true, l: false, b: true, r: true },
      ],
    ],
  };
</script>

{#key key}
  <div id="blocks-container">
    {#each blocks as block}
      <DraggableBlock
        block={preset[block[0]]}
        type={block[0]}
        {blockState}
        {slotIdx}
      />
    {/each}
  </div>
{/key}

<style>
  #blocks-container {
    position: relative;
    max-width: 350px;
    display: flex;
    flex-wrap: wrap;
  }
</style>
