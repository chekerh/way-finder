export interface FallbackFlightOffer {
  destinationCode: string;
  offer: any;
}

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
    description: 'Découvrez la Joconde et plus de 35 000 œuvres dans le musée le plus visité au monde.',
    imageUrl: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&h=600&fit=crop&q=80',
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
    description: 'Accès au deuxième étage de la Tour Eiffel suivi d’une croisière sur la Seine.',
    imageUrl: 'https://images.unsplash.com/photo-1502602898669-a6655f84aff2?w=800&h=600&fit=crop&q=80',
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
    description: 'Coupe-file pour le Colisée, le Forum Romain et le Mont Palatin avec guide francophone.',
    imageUrl: 'https://images.unsplash.com/photo-1526481280695-3c46973e3323?w=800&h=600&fit=crop&q=80',
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
    description: 'Dégustez les meilleures spécialités romaines dans le quartier animé de Trastevere.',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop&q=80',
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
    description: 'Balade en 4x4 dans le désert avec sandboarding, spectacle et dîner BBQ.',
    imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=600&fit=crop&q=80',
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
    description: 'Visite guidée de la médina de Tunis et découverte des artisans locaux.',
    imageUrl: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&h=600&fit=crop&q=80',
    address: 'Place de la Kasbah, Tunis',
    price: 15,
    rating: 4.5,
    tags: ['culture', 'artisanat'],
    coordinates: { lat: 36.7997, lon: 10.162 },
  },
];

