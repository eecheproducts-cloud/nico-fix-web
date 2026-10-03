// assets/js/services-search.js
// Live search over the services list. Every service is indexed in English AND Spanish (plus
// a few synonyms, including common Dutch words expats use), so a query matches regardless
// of the language the page is currently shown in.

const MIN_QUERY_LENGTH = 2;
const MAX_SUGGESTIONS = 3;

const SYNONYMS = {
  svc_pergola: ['gazebo', 'prieel', 'overkapping', 'terraza', 'toldo', 'patio'],
  svc_bathtub_removal: ['tina', 'banera', 'bad', 'ligbad', 'tub', 'bathtub', 'bano', 'sacar', 'quitar', 'remove'],
  svc_bike_assembly: ['bicycle', 'bici', 'bicicleta', 'fiets', 'bike'],
  svc_microcement: ['microcemento', 'beton', 'cire', 'betoncire', 'cemento'],
  svc_tap_replacement: ['grifo', 'griferia', 'canilla', 'kraan', 'buitenkraan', 'faucet', 'mixer', 'monomando'],
  svc_faucet_repair: ['grifo', 'canilla', 'kraan', 'gotea', 'goteo', 'perdida', 'leak', 'drip', 'lekt'],
  svc_simple_plumbing: ['loodgieter', 'plomero', 'fontanero', 'plumber', 'fontaneria'],
  svc_pipe_install: ['cano', 'tubo', 'tuberia', 'caneria', 'leiding', 'grifo', 'canilla', 'kraan'],
  svc_ikea_kitchen: ['ikea', 'keuken', 'metod', 'cocina', 'kitchen'],
  svc_kitchen_furniture: ['ikea', 'keuken', 'mueble', 'kast'],
  svc_furniture_assembly: ['ikea', 'mueble', 'meubel', 'pax', 'kallax', 'armado', 'armar'],
  svc_closet_assembly: ['ropero', 'placard', 'armario', 'kastenwand', 'wardrobe', 'pax'],
  svc_lighting_install: ['lampara', 'luz', 'luces', 'plafon', 'verlichting', 'lamp', 'light'],
  svc_tv_mount: ['tele', 'television', 'soporte', 'televisie'],
  svc_toilet_install: ['wc', 'inodoro', 'retrete', 'bano', 'toilet'],
  svc_drain_clearing: ['ontstoppen', 'destapar', 'tapado', 'tapada', 'clog', 'blocked', 'verstopt'],
  svc_ceramic_tiling: ['tegels', 'tegel', 'azulejo', 'azulejos', 'baldosa', 'tile', 'tiles', 'ceramica'],
  svc_laminate_flooring: ['piso', 'suelo', 'vloer', 'floor', 'parquet', 'laminaat'],
  svc_skirting: ['plinten', 'plint', 'zocalo', 'rodapie'],
  svc_interior_painting: ['pintar', 'pintor', 'schilderen', 'schilder', 'painter'],
  svc_exterior_painting: ['pintar', 'pintor', 'schilderen', 'schilder', 'painter', 'fachada'],
  svc_hanging: ['cuadro', 'espejo', 'cortina', 'ophangen', 'gordijn'],
  svc_garden_maintenance: ['tuin', 'jardin', 'cesped', 'pasto', 'gras', 'lawn', 'poda'],
  svc_lock_change: ['slot', 'cerradura', 'llave', 'cilinder'],
  svc_doorbell_intercom: ['deurbel', 'timbre', 'portero', 'ring'],
  svc_shelving: ['repisa', 'estante', 'plank', 'shelf', 'shelves'],
};

export function normalize(text) {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function buildSearchIndex(services, translations, categoryLabels, synonyms = SYNONYMS) {
  return services.map((service, position) => {
    const sources = [
      translations.en?.[service.key],
      translations.es?.[service.key],
      categoryLabels.en?.[service.category],
      categoryLabels.es?.[service.category],
      ...(synonyms[service.key] || []),
    ];
    const text = normalize(sources.filter(Boolean).join(' '));
    return { key: service.key, position, text, words: [...new Set(text.split(' '))] };
  });
}

// Optimal string alignment distance: Levenshtein plus adjacent transpositions ("pergloa").
function editDistance(a, b) {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const d = Array.from({ length: rows }, (_, i) => [i, ...new Array(cols - 1).fill(0)]);
  for (let j = 0; j < cols; j += 1) d[0][j] = j;
  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[rows - 1][cols - 1];
}

function matchScore(entry, tokens) {
  let score = 0;
  for (const token of tokens) {
    if (entry.words.some((word) => word.startsWith(token))) score += 2;
    else if (token.length >= 3 && entry.text.includes(token)) score += 1;
    else return 0;
  }
  return score;
}

function typoDistance(entry, tokens) {
  let total = 0;
  for (const token of tokens) {
    if (token.length < 3) continue;
    let best = Infinity;
    for (const word of entry.words) {
      best = Math.min(best, editDistance(token, word), editDistance(token, word.slice(0, token.length)));
    }
    const allowed = token.length <= 4 ? 1 : 2;
    if (best > allowed) return Infinity;
    total += best;
  }
  return total;
}

export function searchServices(query, index) {
  const normalized = normalize(query);
  if (normalized.length < MIN_QUERY_LENGTH) return { matches: [], suggestions: [], active: false };

  const tokens = normalized.split(' ');
  const matches = index
    .map((entry) => ({ entry, score: matchScore(entry, tokens) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.entry.position - b.entry.position)
    .map(({ entry }) => entry.key);

  if (matches.length > 0) return { matches, suggestions: [], active: true };

  const suggestions = index
    .map((entry) => ({ entry, distance: typoDistance(entry, tokens) }))
    .filter(({ distance }) => Number.isFinite(distance))
    .sort((a, b) => a.distance - b.distance || a.entry.position - b.entry.position)
    .slice(0, MAX_SUGGESTIONS)
    .map(({ entry }) => entry.key);

  return { matches: [], suggestions, active: true };
}
