// assets/js/coverage.js
// "Do I cover your area?" check by Dutch postcode.
//
// The postcode is looked up in PDOK Locatieserver, the Dutch government's free address service
// (built on the official BAG address register). That tells us whether the postcode really
// exists, which town it belongs to and where it is. Nico's area is the Randstad ring, "Rotterdam,
// The Hague, Amsterdam, Utrecht and everything in between", so the answer depends on the distance
// from the postcode to the area between those four city centres (Utrecht added 2026-10-16).

const PDOK_URL = 'https://api.pdok.nl/bzk/locatieserver/search/v3_1/free';

// City centres (longitude, latitude) of the corners of the area.
const ROTTERDAM = [4.4777, 51.9244];
const THE_HAGUE = [4.3007, 52.0705];
const AMSTERDAM = [4.9041, 52.3676];
const UTRECHT = [5.1214, 52.0907];
// Corners in order around the ring; the shape is convex, which insideArea relies on.
const AREA = [ROTTERDAM, THE_HAGUE, AMSTERDAM, UTRECHT];

// Distance outside the area, in km. Calibrated on town centres (Maria 2026-10-10: Dordrecht is
// regular area), e.g. Zaandam 10, Hilversum 10, Haarlem 13, Purmerend 16, Dordrecht 17,
// Amersfoort 20, Almere 21, Gorinchem 22 (yes); Hellevoetsluis 25, Veenendaal 31, Alkmaar 31 (maybe);
// Lelystad 42, Breda 44 (no).
export const YES_KM = 23;
export const MAYBE_KM = 35;

const POSTCODE_RE = /^([1-9][0-9]{3})\s*([A-Z]{2})?$/;

// Returns { digits, letters, postcode } for a well-formed Dutch postcode ("3011 AB" or "3011"),
// or null. Letter pairs SA, SD and SS are never issued in the Netherlands.
export function parsePostcode(input) {
  const match = String(input ?? '').trim().toUpperCase().match(POSTCODE_RE);
  if (!match) return null;
  const [, digits, letters] = match;
  if (letters && ['SA', 'SD', 'SS'].includes(letters)) return null;
  return { digits, letters: letters || null, postcode: letters ? `${digits} ${letters}` : digits };
}

export function pdokUrl(parsed) {
  // A full postcode must exist exactly; four digits match any postcode starting with them.
  const q = parsed.letters ? `postcode:${parsed.digits}${parsed.letters}` : `postcode:${parsed.digits}*`;
  const params = new URLSearchParams({ q, fq: 'type:postcode', fl: 'postcode,woonplaatsnaam,centroide_ll', rows: '1' });
  return `${PDOK_URL}?${params}`;
}

// Reads a PDOK response into { found, postcode, place, lon, lat }.
export function readPdokResponse(json) {
  const doc = json?.response?.docs?.[0];
  const point = String(doc?.centroide_ll ?? '').match(/POINT\(([-\d.]+) ([-\d.]+)\)/);
  if (!doc || !point) return { found: false };
  return {
    found: true, postcode: doc.postcode || null, place: doc.woonplaatsnaam || null,
    lon: Number(point[1]), lat: Number(point[2]),
  };
}

// Flat projection to km; accurate enough at this scale (the whole area is ~60 km across).
function toKm([lon, lat]) {
  return [lon * 111.32 * Math.cos((52.1 * Math.PI) / 180), lat * 110.57];
}

function distanceToSegment(p, a, b) {
  const [px, py] = toKm(p);
  const [ax, ay] = toKm(a);
  const [bx, by] = toKm(b);
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
}

function insideArea(p, corners) {
  const [P, ...V] = [p, ...corners].map(toKm);
  let pos = false;
  let neg = false;
  V.forEach((a, i) => {
    const b = V[(i + 1) % V.length];
    const cross = (b[0] - a[0]) * (P[1] - a[1]) - (b[1] - a[1]) * (P[0] - a[0]);
    if (cross > 0) pos = true;
    if (cross < 0) neg = true;
  });
  return !(pos && neg);
}

// Km from a point to the Rotterdam / The Hague / Amsterdam / Utrecht area (0 inside it).
export function distanceToArea(lon, lat) {
  const p = [lon, lat];
  if (insideArea(p, AREA)) return 0;
  return Math.min(...AREA.map((a, i) => distanceToSegment(p, a, AREA[(i + 1) % AREA.length])));
}

export function classifyPoint(lon, lat) {
  const km = distanceToArea(lon, lat);
  if (km <= YES_KM) return 'yes';
  if (km <= MAYBE_KM) return 'maybe';
  return 'no';
}

// Full check. Resolves to { status, postcode, place } where status is one of:
// invalid (not a postcode format), notfound (well-formed but does not exist),
// error (lookup failed, e.g. offline), yes, maybe, no.
export async function checkPostcode(input, fetchImpl = globalThis.fetch) {
  const parsed = parsePostcode(input);
  if (!parsed) return { status: 'invalid', postcode: null, place: null };

  let result;
  try {
    const response = await fetchImpl(pdokUrl(parsed));
    if (!response.ok) throw new Error(`PDOK answered ${response.status}`);
    result = readPdokResponse(await response.json());
  } catch (err) {
    return { status: 'error', postcode: parsed.postcode, place: null };
  }

  // Guard against a near match: the postcode PDOK returns must be the one that was asked for.
  const wanted = `${parsed.digits}${parsed.letters || ''}`;
  if (!result.found || !String(result.postcode || '').startsWith(wanted)) {
    return { status: 'notfound', postcode: parsed.postcode, place: null };
  }
  return { status: classifyPoint(result.lon, result.lat), postcode: parsed.postcode, place: result.place };
}
