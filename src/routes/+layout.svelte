<script>
  import Header from "$lib/components/Header.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import Login from "$lib/components/Login.svelte";
  import "../app.css";
  let { children } = $props();
</script>

<Header />
<main class="row-layout">
  <article>
    {@render children()}
  </article>
  <aside>
    <section id="login"><Login /></section>
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
