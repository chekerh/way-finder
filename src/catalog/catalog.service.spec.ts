import { CatalogService } from './catalog.service';
import { AmadeusService } from './amadeus.service';
import { TequilaService } from './tequila.service';
import { ActivitiesService } from './activities.service';
import { UserService } from '../user/user.service';

describe('CatalogService', () => {
  let catalogService: CatalogService;
  const amadeus = { searchFlights: jest.fn() } as unknown as AmadeusService;
  const tequila = { searchExplore: jest.fn() } as unknown as TequilaService;
  const activities = { findActivities: jest.fn() } as unknown as ActivitiesService;
  const userService = { findById: jest.fn() } as unknown as UserService;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.useFakeTimers().setSystemTime(new Date('2025-01-01T00:00:00Z'));
    catalogService = new CatalogService(amadeus, tequila, activities, userService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('builds recommended flight search from user preferences', async () => {
    (userService.findById as jest.Mock).mockResolvedValue({
      onboarding_preferences: {
        home_airport: 'TUN',
        destination_preferences: ['CDG'],
        travel_type: 'business',
        currency: 'EUR',
        budget_cap: 800,
      },
    });

    (amadeus.searchFlights as jest.Mock).mockResolvedValue({ data: [] });

    await catalogService.getRecommendedFlights('user123', { adults: 2, maxResults: 3 });

    expect(amadeus.searchFlights).toHaveBeenCalledWith(
      expect.objectContaining({
        originLocationCode: 'TUN',
        destinationLocationCode: 'CDG',
        travelClass: 'BUSINESS',
        currencyCode: 'EUR',
        max: 3,
        maxPrice: 800,
        adults: 2,
        departureDate: '2025-01-15',
        returnDate: '2025-01-22',
      }),
    );
  });

  it('passes explore parameters to Tequila service', async () => {
    (tequila.searchExplore as jest.Mock).mockResolvedValue({ data: [] });

    await catalogService.getExploreOffers({
      origin: 'TUN',
      destination: 'DXB',
      dateFrom: '2025-02-01',
      dateTo: '2025-02-10',
      budget: 400,
      limit: 5,
    });

    expect(tequila.searchExplore).toHaveBeenCalledWith({
      origin: 'TUN',
      destination: 'DXB',
      dateFrom: '2025-02-01',
      dateTo: '2025-02-10',
      budget: 400,
      limit: 5,
    });
  });

  it('delegates activity lookups to OpenTripMap service', async () => {
    (activities.findActivities as jest.Mock).mockResolvedValue([{ name: 'Louvre' }]);

    await catalogService.getActivitiesFeed({
      city: 'Paris',
      themes: ['cultural'],
      limit: 6,
      radiusMeters: 10000,
    });

    expect(activities.findActivities).toHaveBeenCalledWith({
      city: 'Paris',
      themes: ['cultural'],
      limit: 6,
      radiusMeters: 10000,
    });
  });
});

