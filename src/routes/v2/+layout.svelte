<script lang="ts">
  import { innerHeightStore } from "$lib/store";
  import type { Snippet } from "svelte";
  import "../../app.css";
  import Modal from "$lib/components/Modal.svelte";

  let {
    children,
  }: {
    children: Snippet;
  } = $props();
</script>

<svelte:window bind:innerHeight={$innerHeightStore} />

<Modal />
{@render children()}
