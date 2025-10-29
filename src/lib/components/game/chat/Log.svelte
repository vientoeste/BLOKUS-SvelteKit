<script lang="ts">
  import type { ChatMessageViewModel } from "$types";
  import ChatMessage from "./Message.svelte";

  let { messages } = $props<{ messages: ChatMessageViewModel[] }>();

  let chatLogElement: HTMLDivElement;
  let showNewMessageIndicator = $state(false);

  let chatScrollOffset = 0;
  const isScrolledToBottom = () => {
    if (!chatLogElement) return true;
    const threshold = 5;
    const storedOffset = chatScrollOffset;
    const newOffset =
      chatLogElement.scrollHeight -
      chatLogElement.scrollTop -
      chatLogElement.clientHeight;
    chatScrollOffset = newOffset;
    return storedOffset < threshold;
  };

  const scrollToBottom = () => {
    if (chatLogElement) {
      console.log("scroll to bottom");
      chatLogElement.scrollTo({
        top: chatLogElement.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  $effect(() => {
    // This line is necessary to trigger the callback of this rune
    messages;

    const userWasScrolledToBottom = isScrolledToBottom();

    queueMicrotask(() => {
      if (userWasScrolledToBottom) {
        scrollToBottom();
      } else {
        showNewMessageIndicator = true;
      }
    });
  });

  const handleScroll = () => {
    if (isScrolledToBottom()) {
      showNewMessageIndicator = false;
    }
  };
</script>

<div id="chat-log-container">
  <div id="chat-log" bind:this={chatLogElement} onscroll={handleScroll}>
    {#each messages as message (message.id)}
      {#if message.isSenderChanged}
        <hr />
      {/if}
      <ChatMessage {message} />
    {/each}
  </div>

  {#if showNewMessageIndicator}
    <button class="new-message-indicator" onclick={scrollToBottom}>
      New Messages ↓
    </button>
  {/if}
</div>

<style>
  #chat-log-container {
    position: relative;
    flex: 1;
    min-height: 0;
    padding: 10px;
    border-radius: 10px;
    background-color: var(--green);
    display: flex;
    flex-direction: column;
  }

  #chat-log {
    background-color: #d9d9d9;
    overflow-y: auto;
    flex: 1;
  }

  .new-message-indicator {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    padding: 8px 16px;
    border-radius: 20px;
    background-color: #9937fe;
    color: white;
    border: none;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    transition: opacity 0.3s;
  }
</style>
