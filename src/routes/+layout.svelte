<script lang="ts">
  import { onMount } from "svelte";

  import Header from "$lib/components/Header.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import Login from "$lib/components/Login.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import UserInfo from "$lib/components/UserInfo.svelte";
  import BlocksContainer from "$lib/components/BlocksContainer.svelte";
  import DebugPanel from "$lib/components/DebugPanel.svelte";

  import { getUserInfoFromLocalStorage } from "$lib/utils";
  import { blockStore, gamePhaseStore, userStore } from "$lib/store";
  import "../app.css";

  let rerenderer = $state(0);

  // [TODO] leave only one subscriber
  blockStore.subscribe(() => {
    if ($gamePhaseStore !== "NOT_STARTED") {
      rerenderer += 1;
    }
  });
  gamePhaseStore.subscribe((phase) => {
    if (phase !== "NOT_STARTED") {
      rerenderer += 1;
    }
  });
  onMount(() => {
    if (
      $userStore.id !== undefined &&
      $userStore.userId !== undefined &&
      $userStore.username !== undefined
    ) {
      return;
    }
    const { id, userId, username } = getUserInfoFromLocalStorage(localStorage);
    if (id !== null && userId !== null && username !== null) {
      userStore.update(() => ({ id, userId, username }));
    }
  });

  let { children } = $props();
</script>

<Header />
<Modal />
<main class="row-layout">
  <article>
    {#if process.env.NODE_ENV === "development"}
      <DebugPanel />
    {/if}
    {@render children()}
  </article>
  <aside>
    <!-- [TODO] need to replace this component: dynamically render the components when sub-pages want to -->
    {#key rerenderer}
      <BlocksContainer />
    {/key}
    {#if $userStore.id === undefined}
      <section id="login"><Login /></section>
    {:else}
      <section id="userInfo"><UserInfo /></section>
    {/if}
  </aside>
</main>
<Footer />

<style>
  main {
    margin: 50px 0;
    width: 62.5%;
    height: auto;
    gap: 2%;
  }
  article {
    width: 69%;
  }
  aside {
    width: 29%;
  }
</style>
