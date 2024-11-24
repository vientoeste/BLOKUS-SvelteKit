<script>
  function goToMain() {
    window.location.href = "/";
  }
  function goToRooms() {
    window.location.href = "/rooms";
  }
  function goToHistories() {
    window.location.href = "/histories";
  }
  function goToRules() {
    // [TODO] implement own rules page
    // window.location.href = "/rules";
    window.location.href = "https://en.wikipedia.org/wiki/Blokus";
  }
</script>

<header>
  <nav>
    <button id="logo-wrapper" onclick={goToMain} type="button">
      <img id="logo" src="/logo-tmp.png" alt="" />
    </button>
    <button id="goto-room" onclick={goToRooms}>Rooms</button>
    <button id="goto-histories" onclick={goToHistories}>Game Histories</button>
    <button id="goto-rules" onclick={goToRules}>How To Play</button>
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
    display: flex;
    flex-direction: row;
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
