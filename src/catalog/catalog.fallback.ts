export interface FallbackFlightOffer {
  destinationCode: string;
  offer: any;
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

