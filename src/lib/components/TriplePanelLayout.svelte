<script lang="ts">
  import { blockSizeStore, innerHeightStore } from "$lib/store";
  import type { Snippet } from "svelte";

  let {
    children,
    left,
    right,
  }: {
    children: Snippet;
    left?: Snippet;
    right?: Snippet;
  } = $props();
</script>

<div
  id="layout-container"
  style="--block-size: {$blockSizeStore}px; --innerHeight: {$innerHeightStore}px;"
>
  <aside id="left-panel">
    {#if left}
      {@render left()}
    {/if}
  </aside>

  <main id="center-container">
    {@render children()}
  </main>

  <aside id="right-panel">
    {#if right}
      {@render right()}
    {/if}
  </aside>
</div>

<style>
  #layout-container {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    height: calc((var(--block-size) + 4px) * 20 - 19px);
  }

  #center-container {
    height: 100%;
    aspect-ratio: 1;
  }

  #left-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-width: calc(var(--block-size) * 5 + 4px);
  }

  #right-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-width: calc(var(--block-size) * 5 + 4px);
  }
</style>
