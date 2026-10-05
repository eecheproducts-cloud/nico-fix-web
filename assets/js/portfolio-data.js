// assets/js/portfolio-data.js
// The order of this list does not matter: sortPortfolio() groups photos of the same work together
// (alphabetically by caption in the page language) with "before" ahead of "after".
// Real photos of Nico's work. Schiedam renovation: "before" = original listing photos
// (professional, pre-purchase state); "after" = phone photos of Nico's finished work.
// Pergola: two photos of a pergola Nico assembled. Tiles/taps: tiled shower with brass shower set,
// and a brass wall-mounted tap. Images live in assets/img/portfolio/.
export const portfolioItems = [
  { image: 'assets/img/portfolio/tiles-shower.jpg', roomKey: 'portfolio_room_tiles_shower', stateKey: null },
  { image: 'assets/img/portfolio/tap-wall.jpg', roomKey: 'portfolio_room_tap', stateKey: null },
  { image: 'assets/img/portfolio/pergola-1.jpg', roomKey: 'portfolio_room_pergola', stateKey: null },
  { image: 'assets/img/portfolio/pergola-2.jpg', roomKey: 'portfolio_room_pergola', stateKey: null },
  { image: 'assets/img/portfolio/kitchen-before.webp', roomKey: 'portfolio_room_kitchen', stateKey: 'portfolio_before' },
  { image: 'assets/img/portfolio/kitchen-after.jpg', roomKey: 'portfolio_room_kitchen', stateKey: 'portfolio_after' },
  { image: 'assets/img/portfolio/bathroom-before.webp', roomKey: 'portfolio_room_bathroom', stateKey: 'portfolio_before' },
  { image: 'assets/img/portfolio/bathroom-after.jpg', roomKey: 'portfolio_room_bathroom', stateKey: 'portfolio_after' },
  { image: 'assets/img/portfolio/boiler-before.webp', roomKey: 'portfolio_room_kitchen', stateKey: 'portfolio_before' },
  { image: 'assets/img/portfolio/living-before.webp', roomKey: 'portfolio_room_living', stateKey: 'portfolio_before' },
];

const STATE_ORDER = { portfolio_before: 0, portfolio_after: 1 };

function sortableLabel(text) {
  return String(text ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

// labelFor(roomKey) returns the caption in the current page language.
export function sortPortfolio(items, labelFor) {
  return items
    .map((item, position) => ({ item, position, label: sortableLabel(labelFor(item.roomKey)) }))
    .sort((a, b) =>
      a.label.localeCompare(b.label)
      || (STATE_ORDER[a.item.stateKey] ?? 2) - (STATE_ORDER[b.item.stateKey] ?? 2)
      || a.position - b.position)
    .map(({ item }) => item);
}
