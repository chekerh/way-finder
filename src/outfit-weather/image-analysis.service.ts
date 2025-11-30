import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ImageAnalysisService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.openai.com/v1';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // You can use OpenAI Vision API or Google Vision API
    // For now, we'll use a simpler approach with keyword matching
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY') || '';
  }

  /**
   * Analyze an outfit image and detect clothing items
   * @param imageUrl URL of the outfit image
   * @returns Array of detected clothing items
   */
  async analyzeOutfit(imageUrl: string): Promise<string[]> {
    // Option 1: Use OpenAI Vision API (if available)
    if (this.apiKey && this.apiKey !== 'your_openai_api_key_here') {
      try {
        console.log('Using OpenAI Vision API for image analysis');
        const result = await this.analyzeWithOpenAI(imageUrl);
        console.log('OpenAI analysis result:', result);
        return result;
      } catch (error) {
        console.error('OpenAI analysis failed, using fallback:', error);
        console.error('Error details:', error.response?.data || error.message);
      }
    } else {
      console.warn('OpenAI API key not configured, using fallback analysis');
    }

    // Option 2: Use Google Vision API (alternative)
    // Option 3: Fallback to keyword-based detection
    console.log('Using fallback analysis (generic items)');
    return this.analyzeWithFallback(imageUrl);
  }

  /**
   * Analyze using OpenAI Vision API
   */
  private async analyzeWithOpenAI(imageUrl: string): Promise<string[]> {
    try {
      console.log('Calling OpenAI Vision API with image URL:', imageUrl);
      const response = await firstValueFrom(
        this.httpService.post<any>(
          `${this.baseUrl}/chat/completions`,
          {
            model: 'gpt-4o', // Updated to use gpt-4o instead of deprecated gpt-4-vision-preview
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: 'Analyze this outfit image carefully and list ALL visible clothing items. Be specific and accurate. Return ONLY a comma-separated list of items in English (e.g., "coat, sweater, skirt, boots, handbag"). Include: tops, bottoms, shoes, outerwear (jackets, coats), and accessories. Do not include generic items if you cannot see them clearly.',
                  },
                  {
                    type: 'image_url',
                    image_url: { url: imageUrl },
                  },
                ],
              },
            ],
            max_tokens: 300,
          },
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      const itemsText = response.data.choices[0].message.content;
      console.log('OpenAI raw response:', itemsText);
      const parsed = this.parseClothingItems(itemsText);
      console.log('Parsed clothing items:', parsed);
      return parsed;
    } catch (error: any) {
      console.error('OpenAI API error:', error.response?.data || error.message);
      throw new HttpException(
        `Failed to analyze image with AI: ${error.message || 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Fallback analysis using basic image metadata or simple heuristics
   */
  private async analyzeWithFallback(imageUrl: string): Promise<string[]> {
    // This is a simplified fallback
    // In a real implementation, you might:
    // 1. Use Google Vision API
    // 2. Use a local ML model
    // 3. Ask the user to tag items manually

    // For now, return a generic set that the user can verify
    return [
      't-shirt',
      'jeans',
      'sneakers',
    ];
  }

  /**
   * Parse clothing items from text response
   */
  private parseClothingItems(text: string): string[] {
    // Clean and parse the response
    const items = text
      .toLowerCase()
      .split(/[,\n]/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
      .map((item) => {
        // Normalize item names
        const normalized: Record<string, string> = {
          't-shirt': 't-shirt',
          'tshirt': 't-shirt',
          'shirt': 'shirt',
          'pants': 'pants',
          'trousers': 'pants',
          'jeans': 'jeans',
          'shorts': 'shorts',
          'jacket': 'jacket',
          'coat': 'coat',
          'sweater': 'sweater',
          'hoodie': 'sweater',
          'sneakers': 'sneakers',
          'shoes': 'sneakers',
          'boots': 'boots',
          'sandals': 'sandals',
          'dress': 'dress',
          'skirt': 'skirt',
        };

        return normalized[item] || item;
      });

    return [...new Set(items)]; // Remove duplicates
  }

  /**
   * Compare detected items with weather recommendations
   */
  compareWithWeather(
    detectedItems: string[],
    suitableItems: string[],
    unsuitableItems: string[],
  ): {
    score: number;
    feedback: string;
    suggestions: string[];
  } {
    let score = 50; // Base score
    const feedback: string[] = [];
    const suggestions: string[] = [];

    // Check for suitable items
    const suitableCount = detectedItems.filter((item) =>
      suitableItems.includes(item),
    ).length;
    score += suitableCount * 10;

    // Check for unsuitable items
    const unsuitableCount = detectedItems.filter((item) =>
      unsuitableItems.includes(item),
    ).length;
    score -= unsuitableCount * 15;

    // Generate feedback
    if (suitableCount > 0) {
      feedback.push(
        `✅ Vous portez ${suitableCount} article(s) adapté(s) à la météo`,
      );
    }

    if (unsuitableCount > 0) {
      feedback.push(
        `⚠️ ${unsuitableCount} article(s) peut(vent) ne pas être adapté(s)`,
      );
      suggestions.push(
        'Considérez remplacer ces articles par des vêtements plus adaptés',
      );
    }

    // Check for missing essential items
    const essentialItems = suitableItems.filter((item) =>
      ['jacket', 'coat', 'sweater', 'raincoat'].includes(item),
    );
    const hasEssential = essentialItems.some((item) =>
      detectedItems.includes(item),
    );

    if (!hasEssential && essentialItems.length > 0) {
      suggestions.push(
        `💡 Pensez à ajouter: ${essentialItems.slice(0, 2).join(', ')}`,
      );
    }

    // Clamp score between 0 and 100
    score = Math.max(0, Math.min(100, score));

    let overallFeedback = '';
    if (score >= 80) {
      overallFeedback = 'Excellent! Votre tenue est parfaitement adaptée à la météo.';
    } else if (score >= 60) {
      overallFeedback = 'Bien! Votre tenue est globalement adaptée, quelques ajustements possibles.';
    } else if (score >= 40) {
      overallFeedback = 'Attention! Votre tenue pourrait ne pas être adaptée à la météo.';
    } else {
      overallFeedback = 'Votre tenue n\'est probablement pas adaptée à la météo prévue.';
    }

    return {
      score,
      feedback: overallFeedback + '\n' + feedback.join('\n'),
      suggestions: suggestions,
    };
  }
}

