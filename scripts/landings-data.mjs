// scripts/landings-data.mjs
// Copy and data for the SEO landing pages built by build-landings.mjs.
// Keep it honest: no reviews, no prices, no years of experience until they are real.
// Services mirror assets/js/services-data.js and the "What I don't do" list on the home page.
export const SITE = 'https://nicofix.nl';
export const WHATSAPP = '31610049118';

const photo = (file, en, es) => ({ src: `/assets/img/portfolio/${file}`, alt: { en, es } });

// Cities named on every service page and in the Google Business Profile service area.
// No separate page per city: pages that only swap the city name count as doorway pages for Google.
export const cities = [
  { name: 'Rotterdam' },
  { name: 'Schiedam' },
  { name: 'The Hague', esName: 'La Haya' },
  { name: 'Amsterdam', esName: 'Ámsterdam' },
  { name: 'Dordrecht' },
  { name: 'Haarlem' },
  { name: 'Utrecht' },
];

export const services = [
  {
    id: 'furniture',
    slug: { en: 'furniture-assembly', es: 'montaje-de-muebles' },
    title: { en: 'Furniture assembly', es: 'Montaje de muebles' },
    short: { en: 'IKEA and other brands, wardrobes and IKEA kitchens.', es: 'IKEA y otras marcas, roperos y cocinas IKEA.' },
    seoTitle: { en: 'Furniture assembly in Rotterdam, The Hague & Amsterdam | Nico Fix', es: 'Montaje de muebles en Rotterdam, La Haya y Ámsterdam | Nico Fix' },
    seoDesc: { en: 'IKEA and furniture assembly in Rotterdam, The Hague, Amsterdam and nearby. Wardrobes, kitchens, beds. Clear price before I start. English and Spanish.', es: 'Montaje de muebles IKEA y otras marcas en Rotterdam, La Haya, Ámsterdam y alrededores. Roperos, cocinas, camas. Precio claro antes de empezar. En español.' },
    h1: { en: 'Furniture assembly in Rotterdam, The Hague & Amsterdam', es: 'Montaje de muebles en Rotterdam, La Haya y Ámsterdam' },
    lead: { en: 'Boxes in the living room? I assemble IKEA and other furniture so you do not have to.', es: '¿Cajas en el living? Armo muebles IKEA y de otras marcas para que no tengas que hacerlo vos.' },
    intro: { en: 'I assemble furniture of any brand, fix it to the wall when it needs it and leave the room clean.', es: 'Armo muebles de cualquier marca, los fijo a la pared cuando hace falta y dejo el ambiente limpio.' },
    items: {
      en: ['Wardrobes, beds, desks, tables and shelving units', 'Built-in closets', 'Full IKEA kitchens, with help choosing and buying', 'Kitchen furniture and cabinets'],
      es: ['Roperos, camas, escritorios, mesas y estanterías', 'Armarios empotrados', 'Cocinas IKEA completas, con ayuda para elegir y comprar', 'Muebles y alacenas de cocina'],
    },
    materials: { en: 'Need screws, wall plugs or anything else? I can buy and bring it.', es: '¿Necesitás tornillos, tarugos o algo más? Lo compro y lo llevo.' },
    image: photo('kitchen-after.jpg', 'Kitchen after renovation', 'Cocina después de la renovación'),
    faq: {
      en: [
        { q: 'How much does furniture assembly cost?', a: 'It depends on the piece and the time it takes. Send me a photo or the product link on WhatsApp and I will give you a price before I start.' },
        { q: 'Do you assemble furniture from any brand?', a: 'Yes. IKEA is the most common, but I assemble other brands too.' },
        { q: 'Can you help me choose and buy an IKEA kitchen?', a: 'Yes. I can help you choose, buy and then assemble it completely.' },
      ],
      es: [
        { q: '¿Cuánto cuesta el montaje de muebles?', a: 'Depende del mueble y del tiempo que lleva. Mandame una foto o el link del producto por WhatsApp y te doy un precio antes de empezar.' },
        { q: '¿Armás muebles de cualquier marca?', a: 'Sí. IKEA es lo más común, pero también armo otras marcas.' },
        { q: '¿Me ayudás a elegir y comprar una cocina IKEA?', a: 'Sí. Te ayudo a elegir, comprar y después la armo completa.' },
      ],
    },
  },
  {
    id: 'mounting',
    slug: { en: 'tv-and-shelf-mounting', es: 'colgado-de-tv-y-estantes' },
    title: { en: 'TV, shelf and picture hanging', es: 'Colgado de TV, estantes y cuadros' },
    short: { en: 'TVs, shelves, mirrors, paintings and curtains.', es: 'Teles, estantes, espejos, cuadros y cortinas.' },
    seoTitle: { en: 'TV mounting & shelf hanging in Rotterdam, The Hague & Amsterdam | Nico Fix', es: 'Colgado de TV y estantes en Rotterdam, La Haya y Ámsterdam | Nico Fix' },
    seoDesc: { en: 'TV mounting, shelves, mirrors and pictures hung properly in Rotterdam, The Hague, Amsterdam and nearby. Clear price upfront. English and Spanish.', es: 'Colgado de TV, estantes, espejos y cuadros en Rotterdam, La Haya, Ámsterdam y alrededores. Precio claro de antemano. En español.' },
    h1: { en: 'TV mounting and shelf hanging in Rotterdam, The Hague & Amsterdam', es: 'Colgado de TV y estantes en Rotterdam, La Haya y Ámsterdam' },
    lead: { en: 'Straight, solid and safe, on the right kind of wall plug for your wall.', es: 'Derecho, firme y seguro, con el tarugo correcto para tu pared.' },
    intro: { en: 'Different walls need different fixings. I check the wall first, so your TV, shelf or mirror stays up.', es: 'Cada pared pide un anclaje distinto. Reviso la pared primero, para que tu tele, estante o espejo quede firme.' },
    items: {
      en: ['TV wall mounts', 'Floating shelves and shelving', 'Mirrors and paintings', 'Curtain rods and rails'],
      es: ['Soportes de pared para TV', 'Estantes flotantes y estanterías', 'Espejos y cuadros', 'Barrales y rieles de cortinas'],
    },
    materials: { en: 'I can bring the right plugs and screws for your wall.', es: 'Puedo llevar los tarugos y tornillos correctos para tu pared.' },
    image: { src: '/assets/img/hero-handyman.jpg', alt: { en: 'Handyman arriving at a client\'s front door with his toolbox', es: 'Arreglatodo llegando a la puerta de un cliente con su caja de herramientas' } },
    faq: {
      en: [
        { q: 'Can you mount a TV on any wall?', a: 'Most walls, yes. I check the wall type first and use the right fixing. If a wall is not suitable I will tell you straight away.' },
        { q: 'Do I need to buy the TV bracket?', a: 'You can buy it yourself or I can choose and bring one that fits your TV.' },
        { q: 'Can you hide the cables?', a: 'Send me a photo of the wall and the TV and I will tell you what is possible.' },
      ],
      es: [
        { q: '¿Podés colgar una tele en cualquier pared?', a: 'En la mayoría, sí. Primero reviso el tipo de pared y uso el anclaje correcto. Si una pared no sirve, te lo digo enseguida.' },
        { q: '¿Tengo que comprar el soporte?', a: 'Podés comprarlo vos o yo elijo y llevo uno que le quede a tu tele.' },
        { q: '¿Podés esconder los cables?', a: 'Mandame una foto de la pared y la tele y te digo qué se puede hacer.' },
      ],
    },
  },
  {
    id: 'painting',
    slug: { en: 'painting', es: 'pintura' },
    title: { en: 'Painting', es: 'Pintura' },
    short: { en: 'Walls, ceilings, frames and facades, cracks repaired first.', es: 'Paredes, techos, marcos y fachadas, grietas reparadas antes.' },
    seoTitle: { en: 'Painter in Rotterdam, The Hague & Amsterdam | Nico Fix', es: 'Pintura en Rotterdam, La Haya y Ámsterdam | Nico Fix' },
    seoDesc: { en: 'Interior and exterior painting in Rotterdam, The Hague, Amsterdam and nearby. Cracks and holes repaired first. Clear price before I start. English and Spanish.', es: 'Pintura de interiores y exteriores en Rotterdam, La Haya, Ámsterdam y alrededores. Grietas y agujeros reparados antes. Precio claro antes de empezar. En español.' },
    h1: { en: 'Painting in Rotterdam, The Hague & Amsterdam', es: 'Pintura en Rotterdam, La Haya y Ámsterdam' },
    lead: { en: 'A good paint job starts with good preparation. I repair, sand and protect before I paint.', es: 'Una buena pintura empieza con una buena preparación. Reparo, lijo y protejo antes de pintar.' },
    intro: { en: 'Interior walls and ceilings, window and door frames, and exterior painting. I repair cracks and holes first so the result lasts.', es: 'Paredes y techos interiores, marcos de ventanas y puertas, y pintura exterior. Reparo grietas y agujeros primero para que el resultado dure.' },
    items: {
      en: ['Interior walls and ceilings', 'Window and door frames', 'Exterior painting and facades', 'Crack and hole repair before painting'],
      es: ['Paredes y techos interiores', 'Marcos de ventanas y puertas', 'Pintura exterior y fachadas', 'Reparación de grietas y agujeros antes de pintar'],
    },
    materials: { en: 'I can choose and buy the paint and materials with you.', es: 'Puedo elegir y comprar la pintura y los materiales con vos.' },
    image: photo('living-before.webp', 'Living room before painting', 'Living antes de pintar'),
    faq: {
      en: [
        { q: 'Do you repair cracks before painting?', a: 'Yes. Cracks and holes are repaired first, otherwise they show through the new paint.' },
        { q: 'Who buys the paint?', a: 'Either you or me. If you prefer, I choose and buy everything the job needs.' },
        { q: 'Do you also paint outside?', a: 'Yes, exterior walls and frames. Roofs I do not do.' },
      ],
      es: [
        { q: '¿Reparás las grietas antes de pintar?', a: 'Sí. Las grietas y agujeros se reparan primero, si no se notan a través de la pintura nueva.' },
        { q: '¿Quién compra la pintura?', a: 'Vos o yo. Si preferís, elijo y compro todo lo que el trabajo necesita.' },
        { q: '¿También pintás por fuera?', a: 'Sí, paredes exteriores y marcos. Techos no hago.' },
      ],
    },
  },
  {
    id: 'bathroom',
    slug: { en: 'bathroom-and-tiling', es: 'bano-y-ceramicos' },
    title: { en: 'Bathroom and tiling', es: 'Baño y cerámicos' },
    short: { en: 'Tiles, microcement, silicone joints and bathroom renovations.', es: 'Cerámicos, microcemento, juntas de silicona y renovación de baños.' },
    seoTitle: { en: 'Bathroom renovation & tiling in Rotterdam, The Hague & Amsterdam | Nico Fix', es: 'Renovación de baño y cerámicos en Rotterdam, La Haya y Ámsterdam | Nico Fix' },
    seoDesc: { en: 'Bathroom renovation, tiling and microcement in Rotterdam, The Hague, Amsterdam and nearby. Visit first, exact quote. English and Spanish.', es: 'Renovación de baño, cerámicos y microcemento en Rotterdam, La Haya, Ámsterdam y alrededores. Visita previa y presupuesto exacto. En español.' },
    h1: { en: 'Bathroom renovation and tiling in Rotterdam, The Hague & Amsterdam', es: 'Renovación de baño y cerámicos en Rotterdam, La Haya y Ámsterdam' },
    lead: { en: 'From re-sealing a shower to a full bathroom renovation. For bigger jobs I visit first, then quote.', es: 'Desde resellar una ducha hasta renovar el baño completo. Para trabajos grandes primero visito y después cotizo.' },
    intro: { en: 'Tiling, microcement (also in wet areas), silicone joints, bathtub removal, extractor fans and complete bathroom renovations.', es: 'Cerámicos, microcemento (también en zonas húmedas), juntas de silicona, retiro de bañera, extractores y renovaciones completas de baño.' },
    items: {
      en: ['Ceramic tiling', 'Microcement, including bathrooms and kitchens', 'Silicone and sealant joints', 'Bathtub removal', 'Extractor fan installation', 'Full bathroom renovations'],
      es: ['Colocación de cerámicos', 'Microcemento, incluso en baños y cocinas', 'Juntas de silicona y sellador', 'Retiro de bañera', 'Instalación de extractores', 'Renovaciones completas de baño'],
    },
    materials: { en: 'I can choose, buy and bring the tiles and materials.', es: 'Puedo elegir, comprar y llevar los cerámicos y materiales.' },
    image: photo('bathroom-after.jpg', 'Bathroom after renovation by Nico Fix', 'Baño después de la renovación de Nico Fix'),
    faq: {
      en: [
        { q: 'Do you come to see the bathroom before quoting?', a: 'For bigger jobs, yes. I come to see it in person first so the quote is exact.' },
        { q: 'Can you do the whole bathroom?', a: 'Yes, full renovations. Gas, boilers and asbestos I do not handle.' },
        { q: 'Can you replace old silicone?', a: 'Yes. Re-sealing the joints in a shower or around a bath is a common job.' },
      ],
      es: [
        { q: '¿Venís a ver el baño antes de cotizar?', a: 'Para trabajos grandes, sí. Voy a verlo en persona primero para que el presupuesto sea exacto.' },
        { q: '¿Podés hacer el baño completo?', a: 'Sí, renovaciones completas. Gas, calderas y asbesto no hago.' },
        { q: '¿Podés cambiar la silicona vieja?', a: 'Sí. Resellar las juntas de una ducha o alrededor de una bañera es un trabajo habitual.' },
      ],
    },
  },
  {
    id: 'plumbing',
    slug: { en: 'plumbing-repairs', es: 'plomeria' },
    title: { en: 'Small plumbing repairs', es: 'Plomería chica' },
    short: { en: 'Taps, leaks, toilets and blocked drains.', es: 'Canillas, pérdidas, inodoros y cañerías tapadas.' },
    seoTitle: { en: 'Handyman for taps, leaks & toilets in Rotterdam, The Hague & Amsterdam | Nico Fix', es: 'Plomería chica en Rotterdam, La Haya y Ámsterdam | Nico Fix' },
    seoDesc: { en: 'Tap replacement, leaks, toilets and blocked drains in Rotterdam, The Hague, Amsterdam and nearby. Clear price before I start. English and Spanish.', es: 'Cambio de canillas, pérdidas, inodoros y cañerías tapadas en Rotterdam, La Haya, Ámsterdam y alrededores. Precio claro antes de empezar. En español.' },
    h1: { en: 'Small plumbing repairs in Rotterdam, The Hague & Amsterdam', es: 'Plomería chica en Rotterdam, La Haya y Ámsterdam' },
    lead: { en: 'A dripping tap or a blocked drain does not need to wait for weeks.', es: 'Una canilla que gotea o una cañería tapada no tiene por qué esperar semanas.' },
    intro: { en: 'I handle the everyday plumbing jobs in the house. Gas, boilers, airco and heat pumps are not part of what I do.', es: 'Me encargo de los trabajos de plomería cotidianos de la casa. Gas, calderas, aire acondicionado y bombas de calor no entran en lo que hago.' },
    items: {
      en: ['Tap and faucet replacement and repair', 'Toilet installation and repair', 'Blocked drains', 'Pipe and outdoor tap installation', 'Simple plumbing jobs'],
      es: ['Cambio y reparación de canillas', 'Instalación y reparación de inodoros', 'Cañerías tapadas', 'Instalación de cañerías y canillas exteriores', 'Trabajos simples de plomería'],
    },
    materials: { en: 'I can buy the part and bring it, or use the one you already have.', es: 'Puedo comprar la pieza y llevarla, o usar la que ya tengas.' },
    image: photo('tap-wall.jpg', 'Tap installed by Nico Fix', 'Canilla instalada por Nico Fix'),
    faq: {
      en: [
        { q: 'Do you fix leaks?', a: 'Simple ones, yes: taps, toilets, connections. For anything involving gas or the boiler you need a certified installer.' },
        { q: 'Do you do emergencies?', a: 'I am a handyman, not an emergency service. Write to me on WhatsApp and I will tell you when I can come.' },
        { q: 'Can you bring the part?', a: 'Yes. Send me the model or a photo and I will get it.' },
      ],
      es: [
        { q: '¿Arreglás pérdidas?', a: 'Las simples, sí: canillas, inodoros, conexiones. Para todo lo que tenga gas o caldera necesitás un instalador certificado.' },
        { q: '¿Atendés urgencias?', a: 'Soy arreglatodo, no un servicio de emergencias. Escribime por WhatsApp y te digo cuándo puedo ir.' },
        { q: '¿Podés llevar la pieza?', a: 'Sí. Mandame el modelo o una foto y la consigo.' },
      ],
    },
  },
  {
    id: 'outdoor',
    slug: { en: 'pergola-and-garden', es: 'pergolas-y-jardin' },
    title: { en: 'Pergolas and garden', es: 'Pérgolas y jardín' },
    short: { en: 'Pergola assembly, garden upkeep and seasonal maintenance.', es: 'Armado de pérgolas, jardín y mantenimiento por estación.' },
    seoTitle: { en: 'Pergola assembly & garden maintenance in Rotterdam, The Hague | Nico Fix', es: 'Armado de pérgolas y mantenimiento de jardín en Rotterdam y La Haya | Nico Fix' },
    seoDesc: { en: 'Pergola assembly, garden upkeep and seasonal home maintenance in Rotterdam, The Hague, Amsterdam and nearby. English and Spanish.', es: 'Armado de pérgolas, jardín y mantenimiento de la casa por estación en Rotterdam, La Haya, Ámsterdam y alrededores. En español.' },
    h1: { en: 'Pergola assembly and garden work in Rotterdam & The Hague', es: 'Armado de pérgolas y trabajos de jardín en Rotterdam y La Haya' },
    lead: { en: 'Get your outdoor space ready for the season without lifting a finger.', es: 'Dejá tu espacio exterior listo para la temporada sin mover un dedo.' },
    intro: { en: 'I assemble pergolas and help keep the house and garden in shape through the seasons.', es: 'Armo pérgolas y ayudo a mantener la casa y el jardín en condiciones durante las estaciones.' },
    items: {
      en: ['Pergola assembly', 'Garden upkeep', 'Seasonal home maintenance', 'Outdoor taps and exterior painting'],
      es: ['Armado de pérgolas', 'Mantenimiento de jardín', 'Mantenimiento de la casa por estación', 'Canillas exteriores y pintura exterior'],
    },
    materials: { en: 'I can pick up the materials the job needs.', es: 'Puedo retirar los materiales que el trabajo necesite.' },
    image: photo('pergola-1.jpg', 'Pergola assembled by Nico Fix', 'Pérgola armada por Nico Fix'),
    faq: {
      en: [
        { q: 'Do you build pergolas from a kit?', a: 'Yes, I assemble pergolas from kits and anchor them properly.' },
        { q: 'Do you do roofs?', a: 'No. Roofs and load-bearing walls are outside what I do.' },
        { q: 'Can I get a price from a photo?', a: 'Often yes. Send photos and measurements by WhatsApp. For bigger jobs I visit first.' },
      ],
      es: [
        { q: '¿Armás pérgolas de kit?', a: 'Sí, armo pérgolas de kit y las fijo bien.' },
        { q: '¿Hacés techos?', a: 'No. Techos y paredes portantes quedan fuera de lo que hago.' },
        { q: '¿Puedo tener un precio con una foto?', a: 'Muchas veces sí. Mandame fotos y medidas por WhatsApp. Para trabajos grandes primero visito.' },
      ],
    },
  },
];

export const copy = {
  en: {
    nav_home: 'Home', nav_services: 'Services', nav_work: 'My work', nav_contact: 'Contact',
    eyebrow: 'Nico Fix Handyman',
    cta: 'Message on WhatsApp', cta_work: 'See my work',
    badge_lang: 'I speak English & Spanish', badge_quote: 'Clear price upfront', badge_kvk: 'KVK registered',
    contact_title: 'Questions, quotes or anything else?',
    contact_body: 'Message me on WhatsApp. Tell me what you need, send a photo if you can, and I will get back to you with a price or to set up a visit.',
    privacy: 'Privacy policy',
    faq_title: 'Frequently asked questions',
    dont_title: 'What I don\'t do:',
    dont_list: 'gas & boilers · asbestos · airco & heat pumps · roofs · load-bearing walls',
    where_title: 'Where I work',
    other_services: 'Other services',
    generic_place: 'the Netherlands',
  },
  es: {
    nav_home: 'Inicio', nav_services: 'Servicios', nav_work: 'Mis trabajos', nav_contact: 'Contacto',
    eyebrow: 'Nico Fix, tu arreglatodo',
    cta: 'Escribime por WhatsApp', cta_work: 'Ver mis trabajos',
    badge_lang: 'Hablo español e inglés', badge_quote: 'Precio claro de antemano', badge_kvk: 'Registrado en KVK',
    contact_title: '¿Dudas, presupuestos o cualquier otra cosa?',
    contact_body: 'Escribime por WhatsApp. Contame qué necesitás, mandame una foto si podés, y te respondo con un precio o para coordinar una visita.',
    privacy: 'Política de privacidad',
    faq_title: 'Preguntas frecuentes',
    dont_title: 'Lo que no hago:',
    dont_list: 'gas y calderas · asbesto · aire acondicionado y bombas de calor · techos · paredes portantes',
    where_title: 'Dónde trabajo',
    other_services: 'Otros servicios',
    generic_place: 'Países Bajos',
  },
};
