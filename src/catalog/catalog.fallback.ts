export interface FallbackFlightOffer {
  destinationCode: string;
  offer: any;
}

// Mapping des descriptions par code d'aéroport
export const DESTINATION_DESCRIPTIONS: Record<string, string> = {
  CDG: 'Paris, la capitale de la France, est réputée pour sa culture, son art, sa gastronomie et ses monuments emblématiques comme la Tour Eiffel, le Louvre et Notre-Dame. Ville romantique par excellence, elle attire des millions de visiteurs chaque année.',
  ORY: 'Paris, la capitale de la France, est réputée pour sa culture, son art, sa gastronomie et ses monuments emblématiques comme la Tour Eiffel, le Louvre et Notre-Dame. Ville romantique par excellence, elle attire des millions de visiteurs chaque année.',
  FCO: "Rome, la capitale de l'Italie, est une ville riche en histoire avec ses monuments antiques, ses églises baroques et sa cuisine délicieuse. Découvrez le Colisée, le Forum romain et la Cité du Vatican.",
  BCN: 'Barcelone, capitale de la Catalogne, est une ville dynamique connue pour son architecture moderniste de Gaudí, ses plages méditerranéennes, sa vie nocturne animée et sa cuisine catalane exceptionnelle.',
  MAD: "Madrid, la capitale de l'Espagne, est une ville vibrante avec ses musées de renommée mondiale, ses parcs magnifiques, sa scène gastronomique et sa vie culturelle riche.",
  LHR: 'Londres, capitale du Royaume-Uni, est une métropole cosmopolite célèbre pour son histoire, ses musées, ses théâtres, ses parcs royaux et sa diversité culturelle.',
  AMS: "Amsterdam, capitale des Pays-Bas, est réputée pour ses canaux pittoresques, ses musées d'art, son architecture historique et son ambiance décontractée unique.",
  ATH: "Athènes, berceau de la civilisation occidentale, offre une combinaison unique d'histoire ancienne avec l'Acropole, de culture moderne et de cuisine méditerranéenne authentique.",
  IST: "Istanbul, ville à cheval entre l'Europe et l'Asie, est un carrefour culturel fascinant avec ses mosquées historiques, ses bazars animés et sa cuisine turque exceptionnelle.",
  DXB: 'Dubaï, ville ultramoderne des Émirats arabes unis, est connue pour ses gratte-ciel impressionnants, ses centres commerciaux de luxe, ses plages et son hospitalité légendaire.',
  JFK: 'New York, la ville qui ne dort jamais, est un centre culturel et financier mondial avec ses musées, ses théâtres de Broadway, ses parcs et son énergie incomparable.',
  NRT: 'Tokyo, capitale du Japon, allie tradition et modernité avec ses temples anciens, sa technologie de pointe, sa cuisine raffinée et sa culture unique.',
  BKK: 'Bangkok, capitale de la Thaïlande, est une ville animée avec ses temples bouddhistes, ses marchés flottants, sa cuisine de rue délicieuse et son hospitalité chaleureuse.',
  SIN: 'Singapour, cité-État moderne, est réputée pour son architecture futuriste, sa cuisine fusion, ses jardins botaniques et son mélange harmonieux de cultures asiatiques.',
  ICN: 'Séoul, capitale de la Corée du Sud, combine palais traditionnels, technologie de pointe, K-pop, cuisine coréenne authentique et une culture dynamique.',
};

export interface FallbackActivity {
  id: string;
  city: string;
  country: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  address: string;
  price?: number;
  rating?: number;
  tags: string[];
  coordinates: {
    lat: number;
    lon: number;
  };
}

export const FALLBACK_FLIGHT_OFFERS: FallbackFlightOffer[] = [
  {
    destinationCode: 'CDG',
    offer: {
      type: 'flight-offer',
      id: 'WF-CDG-001',
      source: 'fallback',
      itineraries: [
        {
          duration: 'PT2H30M',
          segments: [
            {
              id: 'WF-CDG-001-1',
              departure: { iataCode: 'TUN', at: '2025-12-05T08:30:00' },
              arrival: { iataCode: 'CDG', at: '2025-12-05T11:00:00' },
              carrierCode: 'TU',
              number: '750',
              aircraft: { code: '32A' },
              duration: 'PT2H30M',
            },
          ],
        },
        {
          duration: 'PT2H35M',
          segments: [
            {
              id: 'WF-CDG-001-2',
              departure: { iataCode: 'CDG', at: '2025-12-12T15:30:00' },
              arrival: { iataCode: 'TUN', at: '2025-12-12T18:05:00' },
              carrierCode: 'TU',
              number: '751',
              aircraft: { code: '32A' },
              duration: 'PT2H35M',
            },
          ],
        },
      ],
      price: { currency: 'EUR', total: '189.00', base: '120.00' },
      validatingAirlineCodes: ['TU'],
    },
  },
  {
    destinationCode: 'FCO',
    offer: {
      type: 'flight-offer',
      id: 'WF-FCO-001',
      source: 'fallback',
      itineraries: [
        {
          duration: 'PT1H25M',
          segments: [
            {
              id: 'WF-FCO-001-1',
              departure: { iataCode: 'TUN', at: '2025-12-06T10:15:00' },
              arrival: { iataCode: 'FCO', at: '2025-12-06T11:40:00' },
              carrierCode: 'AZ',
              number: '865',
              aircraft: { code: '32N' },
              duration: 'PT1H25M',
            },
          ],
        },
        {
          duration: 'PT1H30M',
          segments: [
            {
              id: 'WF-FCO-001-2',
              departure: { iataCode: 'FCO', at: '2025-12-13T17:10:00' },
              arrival: { iataCode: 'TUN', at: '2025-12-13T18:40:00' },
              carrierCode: 'AZ',
              number: '866',
              aircraft: { code: '32N' },
              duration: 'PT1H30M',
            },
          ],
        },
      ],
      price: { currency: 'EUR', total: '210.00', base: '140.00' },
      validatingAirlineCodes: ['AZ'],
    },
  },
  {
    destinationCode: 'DXB',
    offer: {
      type: 'flight-offer',
      id: 'WF-DXB-001',
      source: 'fallback',
      itineraries: [
        {
          duration: 'PT6H10M',
          segments: [
            {
              id: 'WF-DXB-001-1',
              departure: { iataCode: 'TUN', at: '2025-12-08T21:00:00' },
              arrival: { iataCode: 'DXB', at: '2025-12-09T04:10:00' },
              carrierCode: 'EK',
              number: '748',
              aircraft: { code: '77W' },
              duration: 'PT6H10M',
            },
          ],
        },
        {
          duration: 'PT6H15M',
          segments: [
            {
              id: 'WF-DXB-001-2',
              departure: { iataCode: 'DXB', at: '2025-12-16T02:45:00' },
              arrival: { iataCode: 'TUN', at: '2025-12-16T08:00:00' },
              carrierCode: 'EK',
              number: '749',
              aircraft: { code: '77W' },
              duration: 'PT6H15M',
            },
          ],
        },
      ],
      price: { currency: 'EUR', total: '420.00', base: '320.00' },
      validatingAirlineCodes: ['EK'],
    },
  },
  {
    destinationCode: 'JFK',
    offer: {
      type: 'flight-offer',
      id: 'WF-JFK-001',
      source: 'fallback',
      itineraries: [
        {
          duration: 'PT11H40M',
          segments: [
            {
              id: 'WF-JFK-001-1',
              departure: { iataCode: 'TUN', at: '2025-12-10T07:20:00' },
              arrival: { iataCode: 'JFK', at: '2025-12-10T13:00:00' },
              carrierCode: 'DL',
              number: '113',
              aircraft: { code: '330' },
              duration: 'PT11H40M',
            },
          ],
        },
        {
          duration: 'PT11H45M',
          segments: [
            {
              id: 'WF-JFK-001-2',
              departure: { iataCode: 'JFK', at: '2025-12-18T22:30:00' },
              arrival: { iataCode: 'TUN', at: '2025-12-19T11:15:00' },
              carrierCode: 'DL',
              number: '114',
              aircraft: { code: '330' },
              duration: 'PT11H45M',
            },
          ],
        },
      ],
      price: { currency: 'EUR', total: '690.00', base: '540.00' },
      validatingAirlineCodes: ['DL'],
    },
  },
  {
    destinationCode: 'BCN',
    offer: {
      type: 'flight-offer',
      id: 'WF-BCN-001',
      source: 'fallback',
      itineraries: [
        {
          duration: 'PT1H50M',
          segments: [
            {
              id: 'WF-BCN-001-1',
              departure: { iataCode: 'TUN', at: '2025-12-07T06:40:00' },
              arrival: { iataCode: 'BCN', at: '2025-12-07T08:30:00' },
              carrierCode: 'VY',
              number: '8871',
              aircraft: { code: '320' },
              duration: 'PT1H50M',
            },
          ],
        },
        {
          duration: 'PT1H55M',
          segments: [
            {
              id: 'WF-BCN-001-2',
              departure: { iataCode: 'BCN', at: '2025-12-14T19:25:00' },
              arrival: { iataCode: 'TUN', at: '2025-12-14T21:20:00' },
              carrierCode: 'VY',
              number: '8872',
              aircraft: { code: '320' },
              duration: 'PT1H55M',
            },
          ],
        },
      ],
      price: { currency: 'EUR', total: '170.00', base: '110.00' },
      validatingAirlineCodes: ['VY'],
    },
  },
  {
    destinationCode: 'LHR',
    offer: {
      type: 'flight-offer',
      id: 'WF-LHR-001',
      source: 'fallback',
      itineraries: [
        {
          duration: 'PT3H15M',
          segments: [
            {
              id: 'WF-LHR-001-1',
              departure: { iataCode: 'TUN', at: '2025-12-09T09:00:00' },
              arrival: { iataCode: 'LHR', at: '2025-12-09T12:15:00' },
              carrierCode: 'BA',
              number: '202',
              aircraft: { code: '320' },
              duration: 'PT3H15M',
            },
          ],
        },
        {
          duration: 'PT3H20M',
          segments: [
            {
              id: 'WF-LHR-001-2',
              departure: { iataCode: 'LHR', at: '2025-12-16T14:30:00' },
              arrival: { iataCode: 'TUN', at: '2025-12-16T17:50:00' },
              carrierCode: 'BA',
              number: '203',
              aircraft: { code: '320' },
              duration: 'PT3H20M',
            },
          ],
        },
      ],
      price: { currency: 'EUR', total: '280.00', base: '200.00' },
      validatingAirlineCodes: ['BA'],
    },
  },
  {
    destinationCode: 'MAD',
    offer: {
      type: 'flight-offer',
      id: 'WF-MAD-001',
      source: 'fallback',
      itineraries: [
        {
          duration: 'PT2H10M',
          segments: [
            {
              id: 'WF-MAD-001-1',
              departure: { iataCode: 'TUN', at: '2025-12-11T11:20:00' },
              arrival: { iataCode: 'MAD', at: '2025-12-11T13:30:00' },
              carrierCode: 'IB',
              number: '3456',
              aircraft: { code: '320' },
              duration: 'PT2H10M',
            },
          ],
        },
        {
          duration: 'PT2H15M',
          segments: [
            {
              id: 'WF-MAD-001-2',
              departure: { iataCode: 'MAD', at: '2025-12-18T16:45:00' },
              arrival: { iataCode: 'TUN', at: '2025-12-18T18:00:00' },
              carrierCode: 'IB',
              number: '3457',
              aircraft: { code: '320' },
              duration: 'PT2H15M',
            },
          ],
        },
      ],
      price: { currency: 'EUR', total: '195.00', base: '130.00' },
      validatingAirlineCodes: ['IB'],
    },
  },
  {
    destinationCode: 'NRT',
    offer: {
      type: 'flight-offer',
      id: 'WF-NRT-001',
      source: 'fallback',
      itineraries: [
        {
          duration: 'PT14H30M',
          segments: [
            {
              id: 'WF-NRT-001-1',
              departure: { iataCode: 'TUN', at: '2025-12-12T10:00:00' },
              arrival: { iataCode: 'NRT', at: '2025-12-13T02:30:00' },
              carrierCode: 'JL',
              number: '601',
              aircraft: { code: '787' },
              duration: 'PT14H30M',
            },
          ],
        },
        {
          duration: 'PT14H45M',
          segments: [
            {
              id: 'WF-NRT-001-2',
              departure: { iataCode: 'NRT', at: '2025-12-20T11:00:00' },
              arrival: { iataCode: 'TUN', at: '2025-12-21T01:45:00' },
              carrierCode: 'JL',
              number: '602',
              aircraft: { code: '787' },
              duration: 'PT14H45M',
            },
          ],
        },
      ],
      price: { currency: 'EUR', total: '850.00', base: '680.00' },
      validatingAirlineCodes: ['JL'],
    },
  },
  {
    destinationCode: 'BKK',
    offer: {
      type: 'flight-offer',
      id: 'WF-BKK-001',
      source: 'fallback',
      itineraries: [
        {
          duration: 'PT11H20M',
          segments: [
            {
              id: 'WF-BKK-001-1',
              departure: { iataCode: 'TUN', at: '2025-12-13T08:30:00' },
              arrival: { iataCode: 'BKK', at: '2025-12-13T19:50:00' },
              carrierCode: 'TG',
              number: '945',
              aircraft: { code: '777' },
              duration: 'PT11H20M',
            },
          ],
        },
        {
          duration: 'PT11H30M',
          segments: [
            {
              id: 'WF-BKK-001-2',
              departure: { iataCode: 'BKK', at: '2025-12-21T14:20:00' },
              arrival: { iataCode: 'TUN', at: '2025-12-22T01:50:00' },
              carrierCode: 'TG',
              number: '946',
              aircraft: { code: '777' },
              duration: 'PT11H30M',
            },
          ],
        },
      ],
      price: { currency: 'EUR', total: '620.00', base: '480.00' },
      validatingAirlineCodes: ['TG'],
    },
  },
  {
    destinationCode: 'SIN',
    offer: {
      type: 'flight-offer',
      id: 'WF-SIN-001',
      source: 'fallback',
      itineraries: [
        {
          duration: 'PT12H15M',
          segments: [
            {
              id: 'WF-SIN-001-1',
              departure: { iataCode: 'TUN', at: '2025-12-14T09:15:00' },
              arrival: { iataCode: 'SIN', at: '2025-12-14T21:30:00' },
              carrierCode: 'SQ',
              number: '351',
              aircraft: { code: '350' },
              duration: 'PT12H15M',
            },
          ],
        },
        {
          duration: 'PT12H25M',
          segments: [
            {
              id: 'WF-SIN-001-2',
              departure: { iataCode: 'SIN', at: '2025-12-22T23:45:00' },
              arrival: { iataCode: 'TUN', at: '2025-12-23T12:10:00' },
              carrierCode: 'SQ',
              number: '352',
              aircraft: { code: '350' },
              duration: 'PT12H25M',
            },
          ],
        },
      ],
      price: { currency: 'EUR', total: '720.00', base: '560.00' },
      validatingAirlineCodes: ['SQ'],
    },
  },
  {
    destinationCode: 'ICN',
    offer: {
      type: 'flight-offer',
      id: 'WF-ICN-001',
      source: 'fallback',
      itineraries: [
        {
          duration: 'PT13H40M',
          segments: [
            {
              id: 'WF-ICN-001-1',
              departure: { iataCode: 'TUN', at: '2025-12-15T07:45:00' },
              arrival: { iataCode: 'ICN', at: '2025-12-15T21:25:00' },
              carrierCode: 'KE',
              number: '654',
              aircraft: { code: '777' },
              duration: 'PT13H40M',
            },
          ],
        },
        {
          duration: 'PT13H50M',
          segments: [
            {
              id: 'WF-ICN-001-2',
              departure: { iataCode: 'ICN', at: '2025-12-23T10:30:00' },
              arrival: { iataCode: 'TUN', at: '2025-12-24T00:20:00' },
              carrierCode: 'KE',
              number: '655',
              aircraft: { code: '777' },
              duration: 'PT13H50M',
            },
          ],
        },
      ],
      price: { currency: 'EUR', total: '780.00', base: '620.00' },
      validatingAirlineCodes: ['KE'],
    },
  },
];

export const FALLBACK_EXPLORE_OFFERS = [
  {
    id: 'EXP-CDG',
    flyFrom: 'TUN',
    flyTo: 'CDG',
    cityFrom: 'Tunis',
    cityTo: 'Paris',
    countryFrom: { code: 'TN', name: 'Tunisia' },
    countryTo: { code: 'FR', name: 'France' },
    price: 189,
    currency: 'EUR',
    localDeparture: '2025-12-05T08:30:00',
    localArrival: '2025-12-05T11:00:00',
    airlines: ['TU'],
  },
  {
    id: 'EXP-FCO',
    flyFrom: 'TUN',
    flyTo: 'FCO',
    cityFrom: 'Tunis',
    cityTo: 'Rome',
    countryFrom: { code: 'TN', name: 'Tunisia' },
    countryTo: { code: 'IT', name: 'Italy' },
    price: 205,
    currency: 'EUR',
    localDeparture: '2025-12-06T10:15:00',
    localArrival: '2025-12-06T11:40:00',
    airlines: ['AZ'],
  },
  {
    id: 'EXP-DXB',
    flyFrom: 'TUN',
    flyTo: 'DXB',
    cityFrom: 'Tunis',
    cityTo: 'Dubai',
    countryFrom: { code: 'TN', name: 'Tunisia' },
    countryTo: { code: 'AE', name: 'United Arab Emirates' },
    price: 420,
    currency: 'EUR',
    localDeparture: '2025-12-08T21:00:00',
    localArrival: '2025-12-09T04:10:00',
    airlines: ['EK'],
  },
  {
    id: 'EXP-JFK',
    flyFrom: 'TUN',
    flyTo: 'JFK',
    cityFrom: 'Tunis',
    cityTo: 'New York',
    countryFrom: { code: 'TN', name: 'Tunisia' },
    countryTo: { code: 'US', name: 'United States' },
    price: 690,
    currency: 'EUR',
    localDeparture: '2025-12-10T07:20:00',
    localArrival: '2025-12-10T13:00:00',
    airlines: ['DL'],
  },
  {
    id: 'EXP-BCN',
    flyFrom: 'TUN',
    flyTo: 'BCN',
    cityFrom: 'Tunis',
    cityTo: 'Barcelona',
    countryFrom: { code: 'TN', name: 'Tunisia' },
    countryTo: { code: 'ES', name: 'Spain' },
    price: 170,
    currency: 'EUR',
    localDeparture: '2025-12-07T06:40:00',
    localArrival: '2025-12-07T08:30:00',
    airlines: ['VY'],
  },
  {
    id: 'EXP-IST',
    flyFrom: 'TUN',
    flyTo: 'IST',
    cityFrom: 'Tunis',
    cityTo: 'Istanbul',
    countryFrom: { code: 'TN', name: 'Tunisia' },
    countryTo: { code: 'TR', name: 'Turkey' },
    price: 230,
    currency: 'EUR',
    localDeparture: '2025-12-09T13:45:00',
    localArrival: '2025-12-09T17:15:00',
    airlines: ['TK'],
  },
];

export const FALLBACK_ACTIVITIES: FallbackActivity[] = [
  {
    id: 'ACT-PAR-LOUVRE',
    city: 'Paris',
    country: 'France',
    name: 'Musée du Louvre',
    category: 'Musées',
    description:
      'Découvrez la Joconde et plus de 35 000 œuvres dans le musée le plus visité au monde.',
    imageUrl:
      'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&h=600&fit=crop&q=80',
    address: 'Rue de Rivoli, 75001 Paris',
    price: 17,
    rating: 4.8,
    tags: ['culture', 'art', 'incontournable'],
    coordinates: { lat: 48.8606, lon: 2.3376 },
  },
  {
    id: 'ACT-PAR-EIFFEL',
    city: 'Paris',
    country: 'France',
    name: 'Tour Eiffel & Croisière',
    category: 'Activités',
    description:
      'Accès au deuxième étage de la Tour Eiffel suivi d’une croisière sur la Seine.',
    imageUrl:
      'https://images.unsplash.com/photo-1502602898669-a6655f84aff2?w=800&h=600&fit=crop&q=80',
    address: 'Champ de Mars, 5 Av. Anatole France, 75007 Paris',
    price: 49,
    rating: 4.7,
    tags: ['romantique', 'panorama'],
    coordinates: { lat: 48.8584, lon: 2.2945 },
  },
  {
    id: 'ACT-ROM-COLOSSEUM',
    city: 'Rome',
    country: 'Italie',
    name: 'Visite du Colisée & Forum',
    category: 'Activités',
    description:
      'Coupe-file pour le Colisée, le Forum Romain et le Mont Palatin avec guide francophone.',
    imageUrl:
      'https://images.unsplash.com/photo-1526481280695-3c46973e3323?w=800&h=600&fit=crop&q=80',
    address: 'Piazza del Colosseo, 1, 00184 Roma',
    price: 42,
    rating: 4.9,
    tags: ['histoire', 'UNESCO'],
    coordinates: { lat: 41.8902, lon: 12.4922 },
  },
  {
    id: 'ACT-ROM-TRASTE',
    city: 'Rome',
    country: 'Italie',
    name: 'Food tour à Trastevere',
    category: 'Restaurants',
    description:
      'Dégustez les meilleures spécialités romaines dans le quartier animé de Trastevere.',
    imageUrl:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop&q=80',
    address: 'Piazza Trilussa, 00153 Roma',
    price: 65,
    rating: 4.6,
    tags: ['gastronomie', 'street-food'],
    coordinates: { lat: 41.8899, lon: 12.4709 },
  },
  {
    id: 'ACT-DXB-DESERT',
    city: 'Dubai',
    country: 'EAU',
    name: 'Safari désert & BBQ',
    category: 'Activités',
    description:
      'Balade en 4x4 dans le désert avec sandboarding, spectacle et dîner BBQ.',
    imageUrl:
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=600&fit=crop&q=80',
    address: 'Prise en charge depuis votre hôtel à Dubai',
    price: 55,
    rating: 4.7,
    tags: ['aventure', 'famille'],
    coordinates: { lat: 24.4539, lon: 54.3773 },
  },
  {
    id: 'ACT-TUN-MEDINA',
    city: 'Tunis',
    country: 'Tunisie',
    name: 'Medina Walking Tour',
    category: 'Musées',
    description:
      'Visite guidée de la médina de Tunis et découverte des artisans locaux.',
    imageUrl:
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&h=600&fit=crop&q=80',
    address: 'Place de la Kasbah, Tunis',
    price: 15,
    rating: 4.5,
    tags: ['culture', 'artisanat'],
    coordinates: { lat: 36.7997, lon: 10.162 },
  },
];
