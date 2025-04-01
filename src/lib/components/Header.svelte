<script>
  import { goto } from "$app/navigation";
  import { modalStore } from "$lib/store";
  import Alert from "./Alert.svelte";
</script>

<header>
  <nav class="row-layout">
    <button id="logo-wrapper" onclick={() => goto("/")} type="button">
      <img id="logo" src="/logo-tmp.png" alt="" />
    </button>
    <button
      id="goto-room"
      onclick={() => {
        const storedId = localStorage.getItem("id");
        if (!storedId) {
          modalStore.open(Alert, {
            title: "need to sign in first",
            message: "please sign in with the form beside.",
          });
          localStorage.removeItem("username");
          localStorage.removeItem("id");
          if (!Boolean(localStorage.getItem("save")))
            localStorage.removeItem("userId");
          return;
        }
        goto("/rooms");
      }}>Rooms</button
    >
    <button id="goto-histories" onclick={() => goto("/histories")}
      >Game Histories</button
    >
    <!-- [TODO] replace href = ... to goto after info page implementation
     https://svelte.dev/docs/kit/migrating-to-sveltekit-2#goto()-changes -->
    <button
      id="goto-rules"
      onclick={() =>
        (window.location.href = "https://en.wikipedia.org/wiki/Blokus")}
      >How To Play</button
    >
  </nav>
</header>

<style>
  /* [TODO] modify menu's interval */
  header {
    display: flex;
    min-width: 100%;
    width: 100%;
    height: 80px;
    background-color: #303030;
    align-items: center;
    justify-content: center;
  }
  nav {
    width: 1200px;
    height: 80px;
    align-items: center;
  }
  #logo {
    height: 60px;
  }
  button {
    border: none;
    background: #303030;
    font-size: 25px;
    font-weight: 500;
    text-align: center;
    color: white;
  }
  button:hover {
    cursor: pointer;
  }
  #logo-wrapper {
    padding-right: 10px;
    padding-top: 10px;
    width: 120px;
    height: 80px;
  }
  #goto-room {
    width: 170px;
  }
  #goto-histories {
    width: 470px;
  }
  #goto-rules {
    width: 370px;
  }
</style>
