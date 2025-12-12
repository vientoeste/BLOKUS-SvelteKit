<script lang="ts">
  import { useGame } from "$lib/client/game/context";
  import { tick } from "svelte";
  import html2canvas from "html2canvas";
  import type { PreviewRequest } from "$lib/client/game/ui/presentation/Board";
  import ColorMatrixRenderer from "./game/ColorMatrixRenderer.svelte";

  const { presentation } = useGame();
  const previewRequest = $presentation?.board.previewRequest;
  let snapshotElement: HTMLElement;
  let lastReq = $state<PreviewRequest | null>(null);
  const matrix = $derived(lastReq?.matrix);

  const handlePreviewRequest = (request: PreviewRequest | null) => {
    if (request && request?.id !== lastReq?.id) {
      lastReq = request;
      processSnapshot(request);
    }
  };

  const processSnapshot = async (request: PreviewRequest) => {
    if (!snapshotElement) {
      return;
    }
    await tick();

    const canvas = await html2canvas(snapshotElement, {
      backgroundColor: null,
      logging: false,
    });

    request.resolve(canvas);
  };

  previewRequest.subscribe((req) => handlePreviewRequest(req));
</script>

<div
  bind:this={snapshotElement}
  style="position: absolute; left: -9999px; top: -9999px;"
>
  {#if lastReq && $matrix}
    <ColorMatrixRenderer id="" matrix={$matrix} />
  {/if}
</div>
