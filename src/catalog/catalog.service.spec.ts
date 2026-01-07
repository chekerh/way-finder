import { CatalogService } from './catalog.service';
import { AmadeusService } from './amadeus.service';
import { ActivitiesService } from './activities.service';
import { UserService } from '../user/user.service';

describe('CatalogService', () => {
  let catalogService: CatalogService;
  const amadeus = {
    searchFlights: jest.fn(),
    isConfigured: jest.fn(),
  } as unknown as AmadeusService;
  const activities = {
    findActivities: jest.fn(),
  } as unknown as ActivitiesService;
  const userService = { findById: jest.fn() } as unknown as UserService;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.useFakeTimers().setSystemTime(new Date('2026-01-01T00:00:00Z'));
    (amadeus.isConfigured as jest.Mock).mockReturnValue(true);
    catalogService = new CatalogService(amadeus, activities, userService);
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

    await catalogService.getRecommendedFlights('user123', {
      adults: 2,
      maxResults: 3,
    });

    expect(amadeus.searchFlights).toHaveBeenCalledWith(
      expect.objectContaining({
        originLocationCode: 'TUN',
        destinationLocationCode: 'CDG',
        travelClass: 'BUSINESS',
        currencyCode: 'EUR',
        max: 3,
        maxPrice: 800,
        adults: 2,
        departureDate: '2026-01-15',
        returnDate: '2026-01-22',
      }),
    );
  });

  it('returns fallback explore offers filtered by destination and budget', async () => {
    const result = await catalogService.getExploreOffers({
      origin: 'TUN',
      destination: 'DXB',
      budget: 500,
      limit: 1,
    });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].flyTo).toBe('DXB');
    expect(result.currency).toBe('EUR');
  });

  it('delegates activity lookups to OpenTripMap service', async () => {
    (activities.findActivities as jest.Mock).mockResolvedValue([
      { name: 'Louvre' },
    ]);

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
