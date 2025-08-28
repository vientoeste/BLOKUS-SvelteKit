<script lang="ts">
  import Alert from "$lib/components/Alert.svelte";
  import { modalStore } from "$lib/store";
  import { onMount } from "svelte";

  onMount(() => {
    modalStore.open(Alert, {
      title: "d",
      message: `a<br>b\nc`,
    });
  });
</script>
