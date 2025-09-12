<script lang="ts">
  import { innerHeightStore } from "$lib/store";
  import type { Snippet } from "svelte";
  import "../../app.css";

  let {
    children,
  }: {
    children: Snippet;
  } = $props();
</script>

<svelte:window bind:innerHeight={$innerHeightStore} />

{@render children()}
