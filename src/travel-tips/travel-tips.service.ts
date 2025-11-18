import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TravelTip, TravelTipDocument } from './travel-tips.schema';
import { CreateTravelTipDto, GetTravelTipsDto, TravelTipCategory } from './travel-tips.dto';

@Injectable()
export class TravelTipsService {
  constructor(
    @InjectModel(TravelTip.name) private travelTipModel: Model<TravelTipDocument>,
  ) {}

  async getTipsForDestination(dto: GetTravelTipsDto): Promise<TravelTipDocument[]> {
    const query: any = {
      destinationId: dto.destinationId,
      isActive: true,
    };

    if (dto.category) {
      query.category = dto.category;
    }

    const tips = await this.travelTipModel
      .find(query)
      .sort({ helpfulCount: -1, viewCount: -1, createdAt: -1 })
      .limit(dto.limit || 10)
      .exec();

    // Increment view count for each tip
    if (tips.length > 0) {
      const tipIds = tips.map(tip => tip._id);
      await this.travelTipModel.updateMany(
        { _id: { $in: tipIds } },
        { $inc: { viewCount: 1 } },
      );
    }

    return tips;
  }

  async generateTipsForDestination(
    destinationId: string,
    destinationName: string,
    city?: string,
    country?: string,
  ): Promise<TravelTipDocument[]> {
    // Check if tips already exist
    const existingTips = await this.travelTipModel.find({
      destinationId,
      isActive: true,
    }).exec();

    if (existingTips.length > 0) {
      return existingTips;
    }

    // Generate tips using rule-based AI
    const tips = this.generateDestinationTips(destinationName, city, country);

    // Create tips in database
    const createdTips = await Promise.all(
      tips.map(tip =>
        this.travelTipModel.create({
          destinationId,
          destinationName,
          city,
          country,
          ...tip,
        }),
      ),
    );

    return createdTips;
  }

  private generateDestinationTips(
    destinationName: string,
    city?: string,
    country?: string,
  ): Array<{
    category: TravelTipCategory;
    title: string;
    content: string;
    tags: string[];
  }> {
    const tips: Array<{
      category: TravelTipCategory;
      title: string;
      content: string;
      tags: string[];
    }> = [];

    const location = city || destinationName;
    const isEuropean = country && ['France', 'Italy', 'Spain', 'Germany', 'United Kingdom', 'Netherlands', 'Switzerland', 'Belgium', 'Portugal', 'Greece', 'Austria'].includes(country);
    const isAsian = country && ['Japan', 'China', 'Thailand', 'Singapore', 'India', 'South Korea', 'Vietnam'].includes(country);
    const isAmerican = country && ['United States', 'Canada', 'Mexico'].includes(country);

    // General tips
    tips.push({
      category: TravelTipCategory.GENERAL,
      title: `Best Time to Visit ${location}`,
      content: isEuropean
        ? `The best time to visit ${location} is during spring (April-June) or fall (September-October) when the weather is mild and crowds are smaller. Summer (July-August) is peak season with higher prices and more tourists.`
        : isAsian
        ? `The ideal time to visit ${location} is during the dry season, typically from November to March. Avoid the monsoon season (June-September) for better weather conditions.`
        : `Plan your visit during the shoulder seasons (spring or fall) for the best balance of weather, prices, and fewer crowds.`,
      tags: ['timing', 'weather', 'planning'],
    });

    // Transportation tips
    tips.push({
      category: TravelTipCategory.TRANSPORTATION,
      title: `Getting Around ${location}`,
      content: isEuropean
        ? `${location} has excellent public transportation. Consider purchasing a multi-day transit pass for unlimited travel on buses, trams, and metros. Walking is also a great way to explore the city center.`
        : isAsian
        ? `Public transportation in ${location} is efficient and affordable. Consider getting a prepaid card for easy access to trains and buses. Taxis and ride-sharing apps are also widely available.`
        : `Renting a car gives you flexibility, but ${location} also has good public transport options. Research the best transportation method based on your itinerary.`,
      tags: ['transport', 'getting around', 'public transit'],
    });

    // Accommodation tips
    tips.push({
      category: TravelTipCategory.ACCOMMODATION,
      title: `Where to Stay in ${location}`,
      content: `Book accommodations in advance, especially during peak season. Consider staying in the city center for easy access to attractions, or in quieter neighborhoods for a more local experience. Read recent reviews and check cancellation policies.`,
      tags: ['hotels', 'accommodation', 'booking'],
    });

    // Food tips
    tips.push({
      category: TravelTipCategory.FOOD,
      title: `Dining in ${location}`,
      content: isEuropean
        ? `Try local specialties and avoid tourist traps by eating where locals eat. Look for restaurants away from main tourist areas. Don't forget to try the local markets for fresh produce and street food.`
        : isAsian
        ? `${location} offers incredible street food culture. Be adventurous but cautious - choose busy stalls with high turnover. Don't miss the local specialties and night markets.`
        : `Explore local cuisine by asking locals for recommendations. Try regional specialties and don't be afraid to venture beyond tourist areas for authentic experiences.`,
      tags: ['food', 'dining', 'local cuisine'],
    });

    // Culture tips
    tips.push({
      category: TravelTipCategory.CULTURE,
      title: `Cultural Etiquette in ${location}`,
      content: isEuropean
        ? `Learn a few basic phrases in the local language. Tipping customs vary - research the local norms. Dress modestly when visiting religious sites. Respect local customs and traditions.`
        : isAsian
        ? `Respect local customs and traditions. Remove shoes when entering homes or temples. Learn basic greetings in the local language. Be mindful of cultural differences in communication styles.`
        : `Research local customs and cultural norms before your visit. Be respectful of local traditions, especially when visiting religious or cultural sites.`,
      tags: ['culture', 'etiquette', 'traditions'],
    });

    // Safety tips
    tips.push({
      category: TravelTipCategory.SAFETY,
      title: `Staying Safe in ${location}`,
      content: `Keep copies of important documents (passport, insurance) separate from originals. Be aware of your surroundings, especially in crowded areas. Use hotel safes for valuables. Know the local emergency numbers (112 in Europe, 911 in North America).`,
      tags: ['safety', 'security', 'emergency'],
    });

    // Budget tips
    tips.push({
      category: TravelTipCategory.BUDGET,
      title: `Budget Tips for ${location}`,
      content: `Set a daily budget and track expenses. Look for free attractions and activities. Consider purchasing city passes for discounts on multiple attractions. Eat like a local to save money - avoid tourist restaurants. Book flights and accommodations in advance for better deals.`,
      tags: ['budget', 'money', 'savings'],
    });

    // Weather tips
    tips.push({
      category: TravelTipCategory.WEATHER,
      title: `Weather in ${location}`,
      content: isEuropean
        ? `Weather can be unpredictable. Pack layers and always bring a light jacket or umbrella, even in summer. Check the forecast before your trip and pack accordingly.`
        : isAsian
        ? `Weather varies significantly by season. Pack appropriate clothing for the season you're visiting. Bring rain gear during monsoon season and light, breathable clothing for hot months.`
        : `Check the weather forecast before packing. Bring appropriate clothing for the season and be prepared for weather changes.`,
      tags: ['weather', 'packing', 'clothing'],
    });

    return tips;
  }

  async createTip(dto: CreateTravelTipDto): Promise<TravelTipDocument> {
    return this.travelTipModel.create(dto);
  }

  async markTipHelpful(tipId: string): Promise<TravelTipDocument> {
    const tip = await this.travelTipModel.findByIdAndUpdate(
      tipId,
      { $inc: { helpfulCount: 1 } },
      { new: true },
    ).exec();

    if (!tip) {
      throw new NotFoundException('Travel tip not found');
    }

    return tip;
  }

  async getTipById(tipId: string): Promise<TravelTipDocument> {
    const tip = await this.travelTipModel.findById(tipId).exec();
    if (!tip) {
      throw new NotFoundException('Travel tip not found');
    }
    return tip;
  }
}

