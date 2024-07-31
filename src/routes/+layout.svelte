<script>
  import Header from "$lib/components/header.svelte";
  import Footer from "$lib/components/footer.svelte";
  import "../app.css";
</script>

<Header />
<main>
  <article>
    <slot />
  </article>
  <aside></aside>
</main>
<Footer />

<style>
  main {
    margin: 50px 0;
    display: flex;
    flex-direction: row;
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
