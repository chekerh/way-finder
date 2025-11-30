import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WeatherService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.openweathermap.org/data/2.5';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // Get API key from environment or use a default (you should set this in your .env)
    this.apiKey = this.configService.get<string>('OPENWEATHER_API_KEY') || '';
  }

  /**
   * Get weather forecast for a destination
   * @param cityName Name of the destination city
   * @param date Optional date for forecast (defaults to current date)
   * @returns Weather data including temperature, condition, etc.
   */
  async getWeatherForecast(cityName: string, date?: Date): Promise<any> {
    if (!this.apiKey) {
      // Fallback to mock data if no API key is configured
      return this.getMockWeatherData(cityName);
    }

    try {
      const targetDate = date || new Date();
      const timestamp = Math.floor(targetDate.getTime() / 1000);

      // Get current weather (for immediate trips)
      const currentWeatherUrl = `${this.baseUrl}/weather?q=${encodeURIComponent(cityName)}&appid=${this.apiKey}&units=metric&lang=fr`;
      
      const response = await firstValueFrom(
        this.httpService.get<any>(currentWeatherUrl),
      );

      const weather = response.data;
      
      return {
        temperature: Math.round(weather.main.temp),
        feels_like: Math.round(weather.main.feels_like),
        condition: this.mapWeatherCondition(weather.weather[0].main),
        description: weather.weather[0].description,
        humidity: weather.main.humidity,
        wind_speed: weather.wind?.speed || 0,
        city: weather.name,
        country: weather.sys.country,
      };
    } catch (error) {
      console.error('Error fetching weather:', error);
      // Return mock data on error
      return this.getMockWeatherData(cityName);
    }
  }

  /**
   * Map OpenWeatherMap conditions to our simplified conditions
   */
  private mapWeatherCondition(condition: string): string {
    const conditionMap: Record<string, string> = {
      Clear: 'sunny',
      Clouds: 'cloudy',
      Rain: 'rainy',
      Drizzle: 'rainy',
      Thunderstorm: 'stormy',
      Snow: 'snowy',
      Mist: 'foggy',
      Fog: 'foggy',
    };
    return conditionMap[condition] || 'moderate';
  }

  /**
   * Get clothing recommendations based on weather
   */
  getClothingRecommendations(weather: any): {
    suitable_items: string[];
    unsuitable_items: string[];
    suggestions: string[];
  } {
    const temp = weather.temperature;
    const condition = weather.condition;

    const suitableItems: string[] = [];
    const unsuitableItems: string[] = [];
    const suggestions: string[] = [];

    // Temperature-based recommendations
    if (temp >= 25) {
      // Hot weather
      suitableItems.push('t-shirt', 'shorts', 'sandals', 'sunglasses', 'hat');
      unsuitableItems.push('jacket', 'coat', 'sweater', 'boots', 'scarf');
      suggestions.push('Portez des vêtements légers et respirants');
    } else if (temp >= 15) {
      // Moderate weather
      suitableItems.push('t-shirt', 'light-jacket', 'jeans', 'sneakers');
      unsuitableItems.push('coat', 'heavy-sweater', 'boots');
      suggestions.push('Une veste légère serait appropriée');
    } else if (temp >= 5) {
      // Cool weather
      suitableItems.push('sweater', 'jacket', 'jeans', 'closed-shoes');
      unsuitableItems.push('t-shirt', 'shorts', 'sandals');
      suggestions.push('Portez des vêtements chauds');
    } else {
      // Cold weather
      suitableItems.push('coat', 'sweater', 'warm-pants', 'boots', 'scarf', 'gloves');
      unsuitableItems.push('t-shirt', 'shorts', 'sandals', 'light-jacket');
      suggestions.push('Portez des vêtements très chauds, plusieurs couches');
    }

    // Condition-based adjustments
    if (condition === 'rainy') {
      suitableItems.push('raincoat', 'umbrella', 'waterproof-shoes');
      unsuitableItems.push('sneakers', 'sandals');
      suggestions.push('N\'oubliez pas un parapluie ou un imperméable');
    } else if (condition === 'snowy') {
      suitableItems.push('winter-boots', 'warm-coat', 'gloves', 'hat');
      suggestions.push('Portez des chaussures antidérapantes');
    } else if (condition === 'sunny') {
      suitableItems.push('sunglasses', 'hat', 'sunscreen');
      suggestions.push('Protégez-vous du soleil');
    }

    return {
      suitable_items: [...new Set(suitableItems)],
      unsuitable_items: [...new Set(unsuitableItems)],
      suggestions: suggestions,
    };
  }

  /**
   * Mock weather data for testing (when API key is not available)
   */
  private getMockWeatherData(cityName: string): any {
    // Simple mock based on city name
    const mockData: Record<string, any> = {
      paris: { temperature: 15, condition: 'cloudy', humidity: 70, wind_speed: 10 },
      london: { temperature: 12, condition: 'rainy', humidity: 80, wind_speed: 15 },
      dubai: { temperature: 35, condition: 'sunny', humidity: 50, wind_speed: 5 },
      newyork: { temperature: 20, condition: 'sunny', humidity: 60, wind_speed: 12 },
      tokyo: { temperature: 18, condition: 'cloudy', humidity: 65, wind_speed: 8 },
    };

    const cityKey = cityName.toLowerCase().replace(/\s+/g, '');
    const data = mockData[cityKey] || { temperature: 20, condition: 'moderate', humidity: 60, wind_speed: 10 };

    return {
      ...data,
      city: cityName,
      country: 'Unknown',
      description: `Weather in ${cityName}`,
    };
  }
}

