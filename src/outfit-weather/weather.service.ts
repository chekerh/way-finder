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
      return this.getMockWeatherData(cityName, date);
    }

    try {
      const targetDate = date || new Date();
      const now = new Date();
      const daysDifference = Math.floor((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      // Extract city name from "City, Country" format for better API matching
      const cityOnly = cityName.split(',')[0].trim();
      console.log(`Fetching weather for: ${cityName} (using city: ${cityOnly}) on date: ${targetDate.toISOString()} (${daysDifference} days from now)`);

      // If date is within 5 days, use forecast API; otherwise use current weather
      if (daysDifference >= 0 && daysDifference <= 5) {
        // Use 5-day forecast API for future dates
        const forecastUrl = `${this.baseUrl}/forecast?q=${encodeURIComponent(cityOnly)}&appid=${this.apiKey}&units=metric&lang=fr`;
        
        const forecastResponse = await firstValueFrom(
          this.httpService.get<any>(forecastUrl),
        );

        const forecasts = forecastResponse.data.list;
        
        // Find the forecast closest to the target date
        let closestForecast = forecasts[0];
        let minTimeDiff = Math.abs(new Date(forecasts[0].dt * 1000).getTime() - targetDate.getTime());
        
        for (const forecast of forecasts) {
          const forecastTime = new Date(forecast.dt * 1000);
          const timeDiff = Math.abs(forecastTime.getTime() - targetDate.getTime());
          if (timeDiff < minTimeDiff) {
            minTimeDiff = timeDiff;
            closestForecast = forecast;
          }
        }

        console.log(`Weather forecast API response for ${cityOnly} on ${targetDate.toISOString()}:`, {
          temp: closestForecast.main.temp,
          condition: closestForecast.weather[0].main,
          date: new Date(closestForecast.dt * 1000).toISOString(),
        });
        
        return {
          temperature: Math.round(closestForecast.main.temp),
          feels_like: Math.round(closestForecast.main.feels_like),
          condition: this.mapWeatherCondition(closestForecast.weather[0].main),
          description: closestForecast.weather[0].description,
          humidity: closestForecast.main.humidity,
          wind_speed: closestForecast.wind?.speed || 0,
          city: forecastResponse.data.city.name,
          country: forecastResponse.data.city.country,
          date: new Date(closestForecast.dt * 1000).toISOString(),
        };
      } else {
        // For dates beyond 5 days or in the past, use current weather
        // (OpenWeatherMap free tier only provides 5-day forecast)
        const currentWeatherUrl = `${this.baseUrl}/weather?q=${encodeURIComponent(cityOnly)}&appid=${this.apiKey}&units=metric&lang=fr`;
        
        const response = await firstValueFrom(
          this.httpService.get<any>(currentWeatherUrl),
        );

        const weather = response.data;
        console.log(`Weather API response for ${cityOnly} (current weather, date ${daysDifference > 5 ? 'beyond forecast range' : 'in past'}):`, {
          temp: weather.main.temp,
          condition: weather.weather[0].main,
        });
        
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
      }
    } catch (error: any) {
      console.error('Error fetching weather from API:', error.response?.data || error.message);
      console.log('Falling back to mock data');
      // Return mock data on error
      return this.getMockWeatherData(cityName, date);
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
   * Uses hash-based approach to generate consistent but varied weather per city and date
   */
  private getMockWeatherData(cityName: string, date?: Date): any {
    // Simple mock based on city name
    // Extract city name from "City, Country" format
    const cityOnly = cityName.split(',')[0].trim().toLowerCase();
    
    const mockData: Record<string, any> = {
      paris: { temperature: 15, condition: 'cloudy', humidity: 70, wind_speed: 10 },
      london: { temperature: 12, condition: 'rainy', humidity: 80, wind_speed: 15 },
      dubai: { temperature: 35, condition: 'sunny', humidity: 50, wind_speed: 5 },
      'new york': { temperature: 20, condition: 'sunny', humidity: 60, wind_speed: 12 },
      newyork: { temperature: 20, condition: 'sunny', humidity: 60, wind_speed: 12 },
      tokyo: { temperature: 18, condition: 'cloudy', humidity: 65, wind_speed: 8 },
      seoul: { temperature: 10, condition: 'cold', humidity: 60, wind_speed: 8 },
      barcelona: { temperature: 22, condition: 'sunny', humidity: 65, wind_speed: 8 },
      rome: { temperature: 19, condition: 'sunny', humidity: 70, wind_speed: 6 },
      madrid: { temperature: 21, condition: 'sunny', humidity: 55, wind_speed: 10 },
      amsterdam: { temperature: 14, condition: 'cloudy', humidity: 75, wind_speed: 12 },
      berlin: { temperature: 13, condition: 'cloudy', humidity: 68, wind_speed: 11 },
      vienna: { temperature: 16, condition: 'cloudy', humidity: 72, wind_speed: 9 },
      prague: { temperature: 11, condition: 'cloudy', humidity: 70, wind_speed: 10 },
      athens: { temperature: 24, condition: 'sunny', humidity: 60, wind_speed: 7 },
      istanbul: { temperature: 17, condition: 'cloudy', humidity: 65, wind_speed: 8 },
      moscow: { temperature: 5, condition: 'cold', humidity: 75, wind_speed: 12 },
      stockholm: { temperature: 8, condition: 'cloudy', humidity: 78, wind_speed: 14 },
      copenhagen: { temperature: 9, condition: 'cloudy', humidity: 76, wind_speed: 13 },
      oslo: { temperature: 7, condition: 'cloudy', humidity: 80, wind_speed: 15 },
      helsinki: { temperature: 6, condition: 'cold', humidity: 82, wind_speed: 16 },
      reykjavik: { temperature: 4, condition: 'cold', humidity: 85, wind_speed: 18 },
      lisbon: { temperature: 20, condition: 'sunny', humidity: 65, wind_speed: 9 },
      porto: { temperature: 18, condition: 'sunny', humidity: 68, wind_speed: 8 },
      milan: { temperature: 17, condition: 'cloudy', humidity: 70, wind_speed: 7 },
      venice: { temperature: 16, condition: 'cloudy', humidity: 75, wind_speed: 6 },
      florence: { temperature: 18, condition: 'sunny', humidity: 68, wind_speed: 7 },
      naples: { temperature: 21, condition: 'sunny', humidity: 65, wind_speed: 8 },
      budapest: { temperature: 15, condition: 'cloudy', humidity: 72, wind_speed: 9 },
      warsaw: { temperature: 12, condition: 'cloudy', humidity: 74, wind_speed: 10 },
      krakow: { temperature: 11, condition: 'cloudy', humidity: 73, wind_speed: 9 },
      brussels: { temperature: 13, condition: 'cloudy', humidity: 76, wind_speed: 11 },
      zurich: { temperature: 14, condition: 'cloudy', humidity: 71, wind_speed: 8 },
      geneva: { temperature: 15, condition: 'cloudy', humidity: 70, wind_speed: 7 },
      lyon: { temperature: 16, condition: 'cloudy', humidity: 69, wind_speed: 8 },
      marseille: { temperature: 19, condition: 'sunny', humidity: 64, wind_speed: 9 },
      nice: { temperature: 20, condition: 'sunny', humidity: 63, wind_speed: 8 },
      cannes: { temperature: 21, condition: 'sunny', humidity: 62, wind_speed: 7 },
      monaco: { temperature: 22, condition: 'sunny', humidity: 61, wind_speed: 6 },
      santorini: { temperature: 23, condition: 'sunny', humidity: 58, wind_speed: 7 },
      mykonos: { temperature: 24, condition: 'sunny', humidity: 57, wind_speed: 8 },
      crete: { temperature: 22, condition: 'sunny', humidity: 59, wind_speed: 7 },
      rhodes: { temperature: 23, condition: 'sunny', humidity: 58, wind_speed: 8 },
      malta: { temperature: 22, condition: 'sunny', humidity: 60, wind_speed: 7 },
      cyprus: { temperature: 25, condition: 'sunny', humidity: 55, wind_speed: 6 },
      marrakech: { temperature: 28, condition: 'sunny', humidity: 45, wind_speed: 5 },
      casablanca: { temperature: 20, condition: 'sunny', humidity: 65, wind_speed: 8 },
      tunis: { temperature: 23, condition: 'sunny', humidity: 60, wind_speed: 7 },
      cairo: { temperature: 30, condition: 'sunny', humidity: 40, wind_speed: 4 },
      johannesburg: { temperature: 18, condition: 'sunny', humidity: 55, wind_speed: 9 },
      cape: { temperature: 19, condition: 'sunny', humidity: 58, wind_speed: 10 },
      'cape town': { temperature: 19, condition: 'sunny', humidity: 58, wind_speed: 10 },
      capetown: { temperature: 19, condition: 'sunny', humidity: 58, wind_speed: 10 },
    };

    // Try exact match first, then try without spaces
    const cityKey = cityOnly.replace(/\s+/g, '');
    let data = mockData[cityOnly] || mockData[cityKey];
    
    // If not found, generate consistent weather based on city name hash and date
    if (!data) {
      // Simple hash function to generate consistent values per city
      let hash = 0;
      for (let i = 0; i < cityOnly.length; i++) {
        hash = ((hash << 5) - hash) + cityOnly.charCodeAt(i);
        hash = hash & hash; // Convert to 32-bit integer
      }
      
      // Add date to hash to vary weather by date
      if (date) {
        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
        for (let i = 0; i < dateStr.length; i++) {
          hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
          hash = hash & hash;
        }
      }
      
      // Generate varied temperature based on hash (between 5°C and 30°C)
      const temperature = 5 + (Math.abs(hash) % 26);
      
      // Generate condition based on hash
      const conditions = ['sunny', 'cloudy', 'rainy', 'moderate'];
      const condition = conditions[Math.abs(hash) % conditions.length];
      
      // Generate humidity (between 40% and 85%)
      const humidity = 40 + (Math.abs(hash) % 46);
      
      // Generate wind speed (between 4 and 18 km/h)
      const wind_speed = 4 + (Math.abs(hash) % 15);
      
      data = { temperature, condition, humidity, wind_speed };
      console.log(`Generated mock weather for ${cityName} on ${date?.toISOString() || 'current date'} using hash:`, data);
    }

    console.log(`Using mock weather data for ${cityName} (normalized: ${cityOnly}):`, data);

    return {
      ...data,
      city: cityName,
      country: 'Unknown',
      description: `Weather in ${cityName}`,
    };
  }
}

