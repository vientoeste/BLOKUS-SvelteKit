<script lang="ts">
  import type { ChatMessageViewModel } from "$types";
  import ChatMessage from "./Message.svelte";

  let { messages } = $props<{ messages: ChatMessageViewModel[] }>();
</script>

<div id="chat-log-container">
  <div id="chat-log">
    {#each messages as message (message.id)}
      {#if message.isSenderChanged}
        <hr />
      {/if}
      <ChatMessage {message} />
    {/each}
  </div>
</div>

<style>
  #chat-log-container {
    flex: 1;
    padding: 10px;
    border-radius: 10px;
    background-color: var(--green);
    min-height: 0;
  }

  #chat-log {
    max-height: 100%;
    background-color: #d9d9d9;
    overflow-y: auto;
  }
</style>
