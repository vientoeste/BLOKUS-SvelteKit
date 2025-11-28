<script lang="ts">
  import { useGame } from "$lib/client/game/context";

  const { state } = useGame();
  const participantStore = $state?.player.players;
</script>

<div id="participants">
  {#each $participantStore as participant, i}
    {#if participant !== undefined}
      {#if i > 0}
        <hr />
      {/if}
      <div class="participant-container">
        <div class="profile-pic-container">
          <!-- [TODO] add actual content -->
          <svg width="52" height="52" xmlns="http://www.w3.org/2000/svg">
            <circle cx="26" cy="26" r="26" fill="#b9b9b9" />
          </svg>
        </div>
        <div class="player-info-container">
          <div class="player-name-container">{participant?.username}</div>
          <div class="player-win-rate-container">
            <!-- [TODO] add actual value -->
            50%
          </div>
          <div class="player-rating-container">
            <!-- [TODO] add actual value -->
            2000
          </div>
        </div>
        <div class="star-container">
          <svg
            width="16"
            height="15"
            viewBox="0 0 16 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 0L9.79611 5.52786H15.6085L10.9062 8.94427L12.7023 14.4721L8 11.0557L3.29772 14.4721L5.09383 8.94427L0.391548 5.52786H6.20389L8 0Z"
              fill="#FFEA00"
            />
          </svg>
        </div>
      </div>
    {/if}
  {/each}
</div>

<style>
  #participants {
    width: 100%;
    height: fit-content;
    padding: 10px;
    background-color: var(--blue);
    border-radius: 10px;
  }

  .profile-pic-container {
    height: 100%;
    aspect-ratio: 1;
    padding: 8px;
    align-items: center;
  }

  .participant-container {
    width: 100%;
    height: 68px;
    background-color: #999999;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .star-container {
    height: 100%;
    padding-top: 8px;
    padding-right: 8px;
    padding-left: 8px;
  }

  .player-info-container {
    height: 100%;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    flex: 1;
  }

  .player-name-container {
    padding-top: 8px;
    font-size: 20px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  .player-win-rate-container {
    font-size: 8px;
  }

  .player-rating-container {
    font-size: 8px;
  }
</style>
