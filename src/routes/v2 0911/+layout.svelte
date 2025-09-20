<script lang="ts">
  import TriplePanelLayout from "$lib/components/TriplePanelLayout.svelte";
  import { blockSizeStore, innerHeightStore } from "$lib/store";
  import type { Snippet } from "svelte";
  import { left, right } from "./rooms/[room_id]/+page.svelte";

  let {
    children,
    // left,
    // right,
  }: {
    children: Snippet;
    // left: Snippet;
    // right: Snippet;
  } = $props();
</script>

<svelte:window bind:innerHeight={$innerHeightStore} />

<TriplePanelLayout {left} {right}>
  {@render children()}
</TriplePanelLayout>

<style>
  :root {
    --none: #b9b9b9;
    --blue: rgba(0, 0, 255, 0.625);
    --red: rgba(255, 0, 0, 0.65);
    --yellow: rgb(0, 220, 0, 0.625);
    --green: rgb(255, 255, 0, 0.75);
  }
</style>
