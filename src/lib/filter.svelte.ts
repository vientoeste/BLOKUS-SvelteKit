// [TODO] move this function to proper position
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
