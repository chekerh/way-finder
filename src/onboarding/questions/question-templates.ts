export interface QuestionOption {
  value: string;
  label: string;
  min?: number;
  max?: number | null;
}

export interface Question {
  id: string;
  type: 'single_choice' | 'multiple_choice' | 'text' | 'number' | 'date';
  text: string;
  options?: QuestionOption[];
  required: boolean;
  priority: number;
  min_selections?: number;
  max_selections?: number;
}

export const QUESTION_TEMPLATES: Record<string, Question> = {
  travel_type: {
    id: 'travel_type',
    type: 'single_choice',
    text: 'What type of trip are you planning?',
    options: [
      { value: 'business', label: 'Business' },
      { value: 'leisure', label: 'Leisure' },
      { value: 'adventure', label: 'Adventure' },
      { value: 'family', label: 'Family' },
      { value: 'solo', label: 'Solo Travel' },
      { value: 'couple', label: 'Romantic Getaway' },
    ],
    required: true,
    priority: 1,
  },
  budget: {
    id: 'budget',
    type: 'single_choice',
    text: 'What is your budget range?',
    options: [
      { value: 'low', label: 'Budget-friendly ($)', min: 0, max: 1000 },
      { value: 'mid_range', label: 'Mid-range ($$)', min: 1000, max: 3000 },
      { value: 'high', label: 'High-end ($$$)', min: 3000, max: 10000 },
      { value: 'luxury', label: 'Luxury ($$$$)', min: 10000, max: null },
    ],
    required: true,
    priority: 2,
  },
  interests: {
    id: 'interests',
    type: 'multiple_choice',
    text: 'What activities interest you? (Select all that apply)',
    options: [
      { value: 'sightseeing', label: 'Sightseeing & Landmarks' },
      { value: 'adventure_sports', label: 'Adventure Sports' },
      { value: 'relaxation', label: 'Relaxation & Spa' },
      { value: 'nightlife', label: 'Nightlife & Entertainment' },
      { value: 'culture', label: 'Culture & History' },
      { value: 'nature', label: 'Nature & Wildlife' },
      { value: 'food', label: 'Food & Dining' },
      { value: 'shopping', label: 'Shopping' },
    ],
    required: true,
    priority: 3,
    min_selections: 1,
    max_selections: 5,
  },
  accommodation_preference: {
    id: 'accommodation_preference',
    type: 'single_choice',
    text: 'What type of accommodation do you prefer?',
    options: [
      { value: 'hotel', label: 'Hotel' },
      { value: 'airbnb', label: 'Airbnb' },
      { value: 'hostel', label: 'Hostel' },
      { value: 'resort', label: 'Luxury Resort' },
      { value: 'budget', label: 'Budget-friendly' },
    ],
    required: false,
    priority: 4,
  },
  destination_preferences: {
    id: 'destination_preferences',
    type: 'multiple_choice',
    text: 'What type of destinations interest you?',
    options: [
      { value: 'beach', label: 'Beach' },
      { value: 'mountains', label: 'Mountains' },
      { value: 'cities', label: 'Cities' },
      { value: 'countryside', label: 'Countryside' },
      { value: 'historical', label: 'Historical Sites' },
      { value: 'tropical', label: 'Tropical' },
    ],
    required: false,
    priority: 5,
    min_selections: 1,
    max_selections: 3,
  },
  group_size: {
    id: 'group_size',
    type: 'single_choice',
    text: 'How many people will be traveling?',
    options: [
      { value: 'solo', label: 'Just me' },
      { value: 'couple', label: '2 people' },
      { value: 'family', label: 'Family (3-4 people)' },
      { value: 'large_group', label: 'Large group (5+ people)' },
    ],
    required: false,
    priority: 6,
  },
  travel_frequency: {
    id: 'travel_frequency',
    type: 'single_choice',
    text: 'How often do you travel?',
    options: [
      { value: 'frequent', label: 'Frequent (monthly or more)' },
      { value: 'occasional', label: 'Occasional (few times a year)' },
      { value: 'rare', label: 'Rare (once a year or less)' },
    ],
    required: false,
    priority: 7,
  },
  climate_preference: {
    id: 'climate_preference',
    type: 'single_choice',
    text: 'What climate do you prefer?',
    options: [
      { value: 'warm', label: 'Warm / Tropical' },
      { value: 'moderate', label: 'Moderate / Temperate' },
      { value: 'cold', label: 'Cold / Winter' },
      { value: 'no_preference', label: 'No preference' },
    ],
    required: false,
    priority: 8,
  },
  duration_preference: {
    id: 'duration_preference',
    type: 'single_choice',
    text: 'How long do you typically travel?',
    options: [
      { value: 'weekend', label: 'Weekend (2-3 days)' },
      { value: 'week', label: 'Week (5-7 days)' },
      { value: 'two_weeks', label: 'Two weeks (10-14 days)' },
      { value: 'month_plus', label: 'Month or more' },
    ],
    required: false,
    priority: 9,
  },
};

