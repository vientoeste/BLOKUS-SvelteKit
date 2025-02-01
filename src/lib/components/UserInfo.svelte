<script lang="ts">
  import { clearLocalStorageAuthStatus } from "$lib/utils";
  import { modalStore, userStore } from "../../Store";
  import Alert from "./Alert.svelte";

  const submitSignOut = async (event: Event) => {
    event.preventDefault();

    const response = await fetch(
      (event.currentTarget as HTMLFormElement).action,
      {
        method: "DELETE",
        credentials: "same-origin",
      },
    );
    if (response.status !== 204) {
      // [TODO] nested modal
      alert("unknown error occured: try again please.");
      return;
    }
    modalStore.open(Alert, {
      title: "successfully signed out",
      message: "see you next!",
    });
    userStore.update(() => ({
      id: undefined,
      userId: undefined,
      username: undefined,
    }));

    clearLocalStorageAuthStatus(localStorage);
  };
</script>

<!-- [TODO] implement components -->
<div id="userInfo-container">
  <div id="userInfo-1">
    <div id="user-profile"></div>
    <div id="user-greet"></div>
    <div id="signout">
      <form action="/api/auth/session" onsubmit={submitSignOut}>
        <button>sign out</button>
      </form>
    </div>
  </div>
  <div id="userInfo-2"></div>
  <div id="userInfo-3">
    <div id="u1" class="goto-button"></div>
    <div id="u2" class="goto-button"></div>
    <div id="u3" class="goto-button"></div>
    <div id="u4" class="goto-button"></div>
    <div id="u5" class="goto-button"></div>
  </div>
</div>

<style>
  #userInfo-container {
    width: 350px;
    height: 180px;
    background: #f8f8f9;
    border: 1px #e4e8ec solid;
  }
  #userInfo-1 {
    height: 90px;
  }
  #userInfo-2 {
    width: 100%;
    height: 22px;
  }
  #userInfo-3 {
    height: 70px;
    display: flex;
    flex-direction: row;
  }
  .goto-button {
    width: 20%;
    height: 68px;
  }
</style>
