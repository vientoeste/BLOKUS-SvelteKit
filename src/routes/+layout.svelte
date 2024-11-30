<script>
  import Header from "$lib/components/Header.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import Login from "$lib/components/Login.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import UserInfo from "$lib/components/UserInfo.svelte";

  import { userStore } from "../Store";
  import "../app.css";

  let { children } = $props();
</script>

<Header />
<Modal />
<main class="row-layout">
  <article>
    {@render children()}
  </article>
  <aside>
    {#if $userStore.userId === undefined}
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
