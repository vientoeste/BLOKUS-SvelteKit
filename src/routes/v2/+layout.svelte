<script lang="ts">
  import { blockSizeStore, innerHeightStore } from "$lib/store";
  import type { Snippet } from "svelte";
  import "../../app.css";

  let {
    children,
  }: {
    children: Snippet;
  } = $props();
</script>

<svelte:window bind:innerHeight={$innerHeightStore} />

<div style="position:absolute; z-index: 0;">
  {$blockSizeStore}
</div>
{@render children()}
