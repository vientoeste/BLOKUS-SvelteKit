<script lang="ts">
  import type { ChatMessageViewModel } from "$types";

  let { message } = $props<{ message: ChatMessageViewModel }>();
</script>

<div class="chat {message.isSystemMessage ? 'system-chat' : 'player-chat'}">
  <p>
    {#if message.isSenderChanged}
      {`${message.publisher}: ${message.content}`}:
    {:else}
      {message.content}
    {/if}
  </p>
</div>

<style>
  .chat {
    display: flex;
    flex-direction: row;
    width: 100%;
    padding-left: 2px;
  }

  .chat p {
    width: 100%;
    white-space: normal;
  }

  .player-chat {
    padding: 2px;
    background-color: #d9d9d9;
    color: #000;
    font-size: 14px;
  }

  .system-chat {
    padding: 2px;
    background-color: #989898;
    color: #fff;
    font-size: 16px;
    justify-content: center;
  }

  .chat-content {
    padding-left: 4px;
  }
</style>
