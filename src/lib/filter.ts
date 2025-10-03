// [TODO] move this function to proper position
import type { SlotIdx } from "$types";
import { clientSlotStore } from "./store";
import { derived, get, writable, type Readable } from "svelte/store";

/**
 * Creates a filter utility for managing selection state of a list of items.
 *
 * @template T The type of the items in the list.
 * @param items A store of Svelte containing the array of items to be managed by the filter utility.
 * 
 * @example
 * ```svelte
 * <script lang="ts">
 *   const { allSelected, indeterminate, selected, items } = createFilter(store);
 * </script>
 * 
 * <!-- select all -->
 * <input type="checkbox" onclick={toggleAll} checked={$allSelected} indeterminate={$indeterminate} />
 * <!-- select each items -->
 * <input type="checkbox" onchange={() => filter.toggleItem(item)} checked={$selected.includes(item)} />
 * ```
 * 
 * @returns An object containing:
 * - `items`: Store of the current list of items.
 * - `selected`: Store of the currently selected items for props `checked` of checkbox `select all` and each checkboxes(by `filter.selected.includes(item)`).
 * - `allSelected`: Store indicates whether all items are selected for props `checked` of checkbox `select all`.
 * - `indeterminate`: Store indicates whether the selection is partial for props `indeterminate` of checkbox `select all`.
 * - `toggleItem`: Function to toggle selection of a single item for props `onchange` of each checkbox(excludes `select all`).
 * - `toggleAll`: Function to toggle selection of all items for props `onclick` of checkbox `select all`.
 */
export const createFilter = <T>(itemStore: Readable<T[]>) => {
  const selected = writable(get(itemStore));
  const items = derived(itemStore, (s) => s);
  itemStore.subscribe((store) => {
    selected.set([...store]);
  });

  const allSelected = derived([items, selected], ([items, selected]) => selected.length > 0 && selected.length === items.length);
  const indeterminate = derived([selected, allSelected], ([selected, allSelected]) =>
    selected.length > 0 && !allSelected);

  const toggleItem = (item: T) => {
    const selectedItems = get(selected);
    const index = selectedItems.indexOf(item);
    if (index > -1) {
      selected.update((store) => {
        store.splice(index, 1);
        return store;
      });
    } else {
      selected.update((store) => [...store, item]);
    }
  };

  const toggleAll = () => {
    if (get(allSelected)) {
      selected.set([]);
    } else {
      selected.set(get(items));
    }
  };

  return {
    items,
    selected,
    allSelected,
    indeterminate,
    toggleItem,
    toggleAll
  };
};

// [TODO] disable empty filters
export const quantityStore = writable([1, 2, 3, 4, 5]);

export const quantityFilter = createFilter(quantityStore);

let colorFilter: ReturnType<typeof createFilter<SlotIdx>> | null = null;

export const getColorFilter = () => {
  if (colorFilter === null) {
    colorFilter = createFilter(clientSlotStore);
  }
  return colorFilter;
};
