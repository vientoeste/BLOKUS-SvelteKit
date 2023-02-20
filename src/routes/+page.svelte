<script lang="ts">
  import type { PageData } from "./$types";
  import { io } from "socket.io-client";

  const socket = io();
  export let data: PageData;
</script>

{#if data.signedIn === true}
  <h1>Welcome, {data.id}!</h1>
  <form action="?/signOut" method="post">
    <button type="submit">sign out</button>
  </form>
{:else}
  <h1>Welcome to Blokus!</h1>
  <p>
    You have to sign in first. <br />
    If you don't have an account, sign in first using the form below.
  </p>
{/if}
<br />
<br />

<form action="?/signIn" method="post">
  <label for="id">ID</label>
  <input id="id" type="text" name="id" />
  <label for="password">PWD</label>
  <input id="password" type="password" name="password" />
  <button type="submit">sign in</button>
</form>
<br />
<form action="?/signUp" method="post">
  <label for="id">ID</label>
  <input id="id" type="text" name="id" />
  <label for="password">PWD</label>
  <input id="password" type="password" name="password" />
  <button type="submit">sign up</button>
</form>
