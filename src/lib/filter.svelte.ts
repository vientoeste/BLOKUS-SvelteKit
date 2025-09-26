// [TODO] move this function to proper position
/**
 * Creates a filter utility for managing selection state of a list of items.
 *
 * @template T The type of the items in the list.
 * @param source A callback function that returns the array of items to be filtered(w. reactivity).
 *
 * @example
 * const someFilter = createFilter<typeof foo>(() => $foo);
 *
 * @returns An object containing:
 * - `items`: The current list of items.
 * - `selected`: The currently selected items for props `checked` of checkbox `select all` and each checkboxes(by `filter.selected.includes(item)`).
 * - `allSelected`: Whether all items are selected for props `checked` of checkbox `select all`.
 * - `indeterminate`: Whether the selection is partial for props `indeterminate` of checkbox `select all`.
 * - `toggleItem`: Function to toggle selection of a single item for props `onchange` of each checkbox(excludes `select all`).
 * - `toggleAll`: Function to toggle selection of all items for props `onclick` of checkbox `select all`.
 */
export const createFilter = <T>(source: () => T[]) => {
  const items = $derived(source());
  let selected = $state([...items]);
  $effect(() => { selected = [...items]; });

  const allSelected = $derived(selected.length === items.length);
  const indeterminate = $derived(selected.length > 0 && !allSelected);

  const toggleItem = (item: T) => {
    const index = selected.indexOf(item);
    if (index > -1) {
      selected.splice(index, 1);
    } else {
      selected.push(item);
    }
  };

  const toggleAll = () => {
    if (allSelected) {
      selected = [];
    } else {
      selected = [...items];
    }
  };

  return {
    get items() { return items; },
    get selected() { return selected; },
    get allSelected() { return allSelected; },
    get indeterminate() { return indeterminate; },
    toggleItem,
    toggleAll
  };
};
