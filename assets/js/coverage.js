// assets/js/coverage.js
// "Do I cover your area?" check by Dutch postcode.
//
// The postcode is looked up in PDOK Locatieserver, the Dutch government's free address service
// (built on the official BAG address register). That tells us whether the postcode really
// exists, which town it belongs to and where it is. Nico's area is "Rotterdam, The Hague,
// Amsterdam and everything in between", so the answer depends on the distance from the postcode
// to the triangle between those three city centres.

const PDOK_URL = 'https://api.pdok.nl/bzk/locatieserver/search/v3_1/free';

// City centres (longitude, latitude) of the corners of the area.
const ROTTERDAM = [4.4777, 51.9244];
const THE_HAGUE = [4.3007, 52.0705];
const AMSTERDAM = [4.9041, 52.3676];

// Distance outside the triangle, in km. Calibrated on real town centres from PDOK, e.g.
// Haarlem 12, Purmerend 16, Almere 21, Dordrecht 22 (yes; Maria 2026-10-10: Dordrecht is regular
// area); Hilversum 24, Utrecht 27, Alkmaar 31 (maybe);
// Lelystad 38, Amersfoort 40, Breda 43 (no).
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

function insideTriangle(p, a, b, c) {
  const [P, A, B, C] = [p, a, b, c].map(toKm);
  const side = (p1, p2, p3) => (p1[0] - p3[0]) * (p2[1] - p3[1]) - (p2[0] - p3[0]) * (p1[1] - p3[1]);
  const d1 = side(P, A, B);
  const d2 = side(P, B, C);
  const d3 = side(P, C, A);
  const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
  const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(hasNeg && hasPos);
}

// Km from a point to the Rotterdam / The Hague / Amsterdam triangle (0 inside it).
export function distanceToArea(lon, lat) {
  const p = [lon, lat];
  if (insideTriangle(p, ROTTERDAM, THE_HAGUE, AMSTERDAM)) return 0;
  return Math.min(
    distanceToSegment(p, ROTTERDAM, THE_HAGUE),
    distanceToSegment(p, THE_HAGUE, AMSTERDAM),
    distanceToSegment(p, AMSTERDAM, ROTTERDAM),
  );
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
