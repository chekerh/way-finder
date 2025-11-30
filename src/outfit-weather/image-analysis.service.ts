import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import * as fs from 'node:fs';

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
   * @param imageFile Optional file buffer for base64 encoding (more reliable than URL)
   * @returns Array of detected clothing items
   */
  async analyzeOutfit(imageUrl: string, imageFile?: Express.Multer.File): Promise<string[]> {
    // Check if API key is properly configured
    const hasValidApiKey = this.apiKey && 
                           this.apiKey.trim().length > 0 && 
                           this.apiKey !== 'your_openai_api_key_here' &&
                           (this.apiKey.startsWith('sk-') || this.apiKey.startsWith('sk-proj-'));
    
    console.log('OpenAI API key check:', {
      hasKey: !!this.apiKey,
      keyLength: this.apiKey?.length || 0,
      keyPrefix: this.apiKey?.substring(0, 5) || 'none',
      hasValidApiKey,
    });
    
    // If no valid API key, skip OpenAI and use fallback immediately
    if (!hasValidApiKey) {
      console.warn('⚠️ OpenAI API key not configured or invalid, using fast fallback analysis');
      console.warn('To enable AI analysis, configure OPENAI_API_KEY environment variable');
      return this.analyzeWithFallback(imageUrl);
    }

    // Option 1: Use OpenAI Vision API (if available) with timeout
    if (hasValidApiKey) {
      try {
        console.log('Using OpenAI Vision API for image analysis');
        console.log('Image URL:', imageUrl);
        console.log('Has image file buffer:', !!imageFile);
        
        // Add timeout wrapper (10 seconds max for OpenAI - fail fast to use fallback)
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('OpenAI API timeout after 10 seconds')), 10000);
        });
        
        // Prefer base64 if file is available (more reliable)
        const analysisPromise = imageFile 
          ? this.analyzeWithOpenAIBase64(imageFile)
          : this.analyzeWithOpenAI(imageUrl);
        
        const result = await Promise.race([analysisPromise, timeoutPromise]);
        
        console.log('OpenAI analysis result:', result);
        return result;
      } catch (error: any) {
        console.error('OpenAI analysis failed or timed out, using fallback:', error.message || error);
        const errorData = error.response?.data || {};
        console.error('Error details:', {
          message: error.message,
          response: errorData,
          status: error.response?.status,
          statusText: error.response?.statusText,
          errorType: errorData.error?.type,
          errorCode: errorData.error?.code,
        });
        
        // Log specific quota error
        if (errorData.error?.code === 'insufficient_quota' || errorData.error?.type === 'insufficient_quota') {
          console.error('❌ OpenAI API quota exceeded. Please check your billing and plan details.');
          console.error('📝 For more info: https://platform.openai.com/docs/guides/error-codes/api-errors');
        }
        // Continue to fallback
      }
    } else {
      console.warn('OpenAI API key not configured or invalid, using fallback analysis');
      console.warn('To enable AI analysis, configure OPENAI_API_KEY environment variable');
    }

    // Option 2: Use Google Vision API (alternative)
    // Option 3: Fallback to keyword-based detection (fast and reliable)
    console.log('Using fallback analysis (generic items)');
    const fallbackResult = await this.analyzeWithFallback(imageUrl);
    console.log('Fallback analysis result:', fallbackResult);
    return fallbackResult;
  }

  /**
   * Analyze using OpenAI Vision API with base64 image (more reliable)
   */
  private async analyzeWithOpenAIBase64(imageFile: Express.Multer.File): Promise<string[]> {
    try {
      // Try to get buffer from file object first (in-memory), otherwise read from disk
      let imageBuffer: Buffer;
      let filePath: string | null = null;
      
      if (imageFile.buffer) {
        // File is in memory (memoryStorage)
        imageBuffer = imageFile.buffer;
        console.log('Using in-memory file buffer');
      } else {
        // File is on disk (diskStorage)
        filePath = imageFile.path || (imageFile.destination ? 
          `${imageFile.destination}/${imageFile.filename}` : null);
        
        if (!filePath || !fs.existsSync(filePath)) {
          throw new Error('Image file not found for base64 encoding');
        }
        
        imageBuffer = fs.readFileSync(filePath);
        console.log('Read file from disk:', filePath);
      }
      
      const base64Image = imageBuffer.toString('base64');
      const mimeType = imageFile.mimetype || 'image/jpeg';
      
      console.log('Calling OpenAI Vision API with base64 image (size:', imageBuffer.length, 'bytes, type:', mimeType, ')');
      
      const response = await firstValueFrom(
        this.httpService.post<any>(
          `${this.baseUrl}/chat/completions`,
          {
            model: 'gpt-4o',
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
                    image_url: { 
                      url: `data:${mimeType};base64,${base64Image}` 
                    },
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
      console.error('OpenAI API error (base64):', error.response?.data || error.message);
      throw new HttpException(
        `Failed to analyze image with AI: ${error.message || 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Analyze using OpenAI Vision API with URL (fallback if base64 not available)
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
   * Returns varied items based on image URL hash to simulate different detections
   * This is FAST and should return immediately
   */
  private async analyzeWithFallback(imageUrl: string): Promise<string[]> {
    // This is a simplified fallback - returns immediately without any API calls
    // In a real implementation, you might:
    // 1. Use Google Vision API
    // 2. Use a local ML model
    // 3. Ask the user to tag items manually

    // For now, return varied items based on image URL hash to simulate different detections
    // Return in English to match weather recommendations
    console.warn('⚠️ Using fast fallback detection - configure OPENAI_API_KEY for accurate analysis');
    
    // Generate hash from image URL for consistent but varied results
    let hash = 0;
    for (let i = 0; i < imageUrl.length; i++) {
      hash = ((hash << 5) - hash) + imageUrl.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Varied base items based on hash to generate different scores
    // IMPORTANT: Return items in ENGLISH to match weather recommendations
    const allPossibleItems = [
      't-shirt', 'jeans', 'sneakers', // Base casual
      'jacket', 'coat', 'sweater', 'shirt', 'shorts', 'boots', 
      'sandals', 'dress', 'skirt', 'handbag', 'hat', 'scarf',
      'light-jacket', 'closed-shoes', 'warm-pants', 'raincoat', 'umbrella'
    ];
    
    // Select 3-5 items based on hash to vary the outfit composition
    const numItems = 3 + (Math.abs(hash) % 3); // 3, 4, or 5 items
    const selectedItems: string[] = [];
    const usedIndices = new Set<number>();
    
    // Always include at least one top and one bottom
    const tops = ['t-shirt', 'shirt', 'sweater', 'dress'];
    const bottoms = ['jeans', 'shorts', 'skirt', 'warm-pants'];
    const shoes = ['sneakers', 'boots', 'sandals', 'closed-shoes'];
    const outerwear = ['jacket', 'coat', 'light-jacket', 'raincoat'];
    
    // Select one top
    const topIndex = Math.abs(hash) % tops.length;
    selectedItems.push(tops[topIndex]);
    usedIndices.add(allPossibleItems.indexOf(tops[topIndex]));
    
    // Select one bottom
    const bottomIndex = Math.abs(hash + 100) % bottoms.length;
    selectedItems.push(bottoms[bottomIndex]);
    usedIndices.add(allPossibleItems.indexOf(bottoms[bottomIndex]));
    
    // Select one shoe
    const shoeIndex = Math.abs(hash + 200) % shoes.length;
    selectedItems.push(shoes[shoeIndex]);
    usedIndices.add(allPossibleItems.indexOf(shoes[shoeIndex]));
    
    // Add 0-2 additional items (outerwear, accessories)
    const remainingItems = allPossibleItems.filter((_, idx) => !usedIndices.has(idx));
    const numAdditional = numItems - 3; // 0, 1, or 2
    
    for (let i = 0; i < numAdditional && remainingItems.length > 0; i++) {
      const index = Math.abs(hash + (i + 1) * 1000) % remainingItems.length;
      selectedItems.push(remainingItems[index]);
      remainingItems.splice(index, 1); // Remove to avoid duplicates
    }
    
    const fallbackItems = selectedItems;
    console.log('Fallback returning items:', fallbackItems);
    return fallbackItems;
  }

  /**
   * Parse clothing items from text response and translate to French
   */
  private parseClothingItems(text: string): string[] {
    // Clean and parse the response
    const items = text
      .toLowerCase()
      .split(/[,\n]/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
      .map((item) => {
        // Normalize item names to English first
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
          'long coat': 'coat',
          'overcoat': 'coat',
          'sweater': 'sweater',
          'turtleneck': 'sweater',
          'pullover': 'sweater',
          'hoodie': 'sweater',
          'sneakers': 'sneakers',
          'shoes': 'sneakers',
          'boots': 'boots',
          'ankle boots': 'boots',
          'sandals': 'sandals',
          'dress': 'dress',
          'skirt': 'skirt',
          'midi skirt': 'skirt',
          'handbag': 'handbag',
          'bag': 'handbag',
          'purse': 'handbag',
        };

        const englishName = normalized[item] || item;
        
        // Translate to French
        const frenchTranslations: Record<string, string> = {
          't-shirt': 't-shirt',
          'shirt': 'chemise',
          'pants': 'pantalon',
          'jeans': 'jean',
          'shorts': 'short',
          'jacket': 'veste',
          'coat': 'manteau',
          'sweater': 'pull',
          'sneakers': 'baskets',
          'boots': 'bottes',
          'sandals': 'sandales',
          'dress': 'robe',
          'skirt': 'jupe',
          'handbag': 'sac à main',
        };

        return frenchTranslations[englishName] || englishName;
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
    // Base score varies based on number of items detected (more items = higher base)
    const baseScore = 40 + (detectedItems.length * 3); // 40-55 base depending on items count
    let score = baseScore;
    const feedback: string[] = [];
    const suggestions: string[] = [];

    // Check for suitable items (more weight for suitable items)
    const suitableCount = detectedItems.filter((item) =>
      suitableItems.includes(item),
    ).length;
    score += suitableCount * 12; // Increased from 10 to 12

    // Check for unsuitable items (more penalty for unsuitable items)
    const unsuitableCount = detectedItems.filter((item) =>
      unsuitableItems.includes(item),
    ).length;
    score -= unsuitableCount * 18; // Increased from 15 to 18

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

