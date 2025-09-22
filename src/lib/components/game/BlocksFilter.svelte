<script lang="ts">
</script>

<div id="filter-container">
  <div id="quantity-filter-group" class="filter-group">
    <div class="filter-select-all">
      <div class="filter-option">
        <input type="checkbox" id="quantity-select-all" />
        <label for="quantity-select-all">Select All</label>
      </div>
    </div>
    <div class="filter-options-wrapper">
      <div class="filter-option">
        <input type="checkbox" id="quantity-5" />
        <label for="quantity-5">5</label>
      </div>
      <div class="filter-option">
        <input type="checkbox" id="quantity-4" />
        <label for="quantity-4">4</label>
      </div>
      <div class="filter-option">
        <input type="checkbox" id="quantity-3" />
        <label for="quantity-3">3</label>
      </div>
      <div class="filter-option">
        <input type="checkbox" id="quantity-2" />
        <label for="quantity-2">2</label>
      </div>
      <div class="filter-option">
        <input type="checkbox" id="quantity-1" />
        <label for="quantity-1">1</label>
      </div>
    </div>
  </div>

  <hr />

  <div id="color-filter-group" class="filter-group">
    <div class="filter-select-all">
      <div class="filter-option">
        <input type="checkbox" id="color-select-all" />
        <label for="color-select-all">Select All</label>
      </div>
    </div>
    <div class="filter-options-wrapper">
      <!-- [TODO] set colors by game state(slots)  -->
      <div class="filter-option">
        <input type="checkbox" id="color-1" />
        <label for="color-1">color1</label>
      </div>
      <div class="filter-option">
        <input type="checkbox" id="color-2" />
        <label for="color-2">color2</label>
      </div>
    </div>
  </div>
</div>

<style>
  input {
    color: #494949;
    border: 0;
    border-radius: 0;
    width: 16px;
    height: 16px;
  }

  input:checked {
    accent-color: #b9b9b9;
  }

  #filter-container {
    border-radius: 10px;
    background-color: var(--red);
    padding: 10px;
  }

  .filter-group {
    display: flex;
    padding: 8px;
    flex-direction: row;
    gap: 24px;
    background-color: var(--background);
    align-items: center;
  }

  .filter-option {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 6px;
  }

  .filter-options-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 16px;
  }
</style>
