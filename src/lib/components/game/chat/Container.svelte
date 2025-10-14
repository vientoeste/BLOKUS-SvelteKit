<script lang="ts">
  import { chatStore } from "$lib/store";
  import ChatLog from "./Log.svelte";
  let messagesViewModel = $derived.by(() =>
    $chatStore.map((chat, idx) => ({
      ...chat,
      isSenderChanged:
        idx === 0 || $chatStore[idx - 1].publisher !== chat.publisher,
    })),
  );
</script>

<ChatLog messages={messagesViewModel} />
