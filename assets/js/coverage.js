// assets/js/coverage.js
// "Do I cover your area?" check by Dutch postcode. Uses the first two digits of the postcode,
// which map to fixed regions. Base is Schiedam; the core area is roughly the Randstad between
// Amsterdam, Haarlem, The Hague, Rotterdam and Dordrecht.

// Two-digit postcode regions Nico covers.
const CORE = new Set([
  '10', '11', // Amsterdam
  '15', // Zaanstad
  '20', '21', // Haarlem, Heemstede, Hoofddorp
  '22', '23', // Noordwijk, Katwijk, Leiden
  '24', // Alphen aan den Rijn
  '25', '26', // The Hague, Delft, Westland
  '27', '28', // Zoetermeer, Gouda
  '29', // Capelle, Krimpen, Ridderkerk
  '30', '31', // Rotterdam, Schiedam, Vlaardingen, Maassluis
  '32', // Spijkenisse, Voorne
  '33', // Dordrecht
]);

// Reachable depending on the job: worth asking.
const EDGE = new Set([
  '12', // Hilversum, Gooi
  '13', // Almere
  '14', // Purmerend
  '19', // Beverwijk, IJmuiden
  '34', '35', '36', // Utrecht area
  '42', // Gorinchem
  '48', // Breda
]);

export function checkPostcode(input) {
  const match = String(input ?? '').trim().toUpperCase().match(/^([1-9][0-9]{3})\s*([A-Z]{2})?$/);
  if (!match) return { status: 'invalid', postcode: null };

  const [, digits, letters] = match;
  const postcode = letters ? `${digits} ${letters}` : digits;
  const region = digits.slice(0, 2);
  if (CORE.has(region)) return { status: 'yes', postcode };
  if (EDGE.has(region)) return { status: 'maybe', postcode };
  return { status: 'no', postcode };
}
