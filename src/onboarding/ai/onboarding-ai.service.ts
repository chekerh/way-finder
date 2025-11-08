import { Injectable } from '@nestjs/common';
import { OnboardingSession } from '../onboarding.schema';
import { QUESTION_TEMPLATES, Question } from '../questions/question-templates';

@Injectable()
export class OnboardingAIService {
  generateNextQuestion(session: OnboardingSession): Question | null {
    const answers = session.answers;
    const answeredIds = session.questions_answered;

    // Required questions first
    if (!answeredIds.includes('travel_type')) {
      return QUESTION_TEMPLATES.travel_type;
    }

    if (!answeredIds.includes('budget')) {
      return QUESTION_TEMPLATES.budget;
    }

    if (!answeredIds.includes('interests')) {
      return QUESTION_TEMPLATES.interests;
    }

    // Adaptive questions based on previous answers
    if (answers.travel_type === 'adventure' && !answeredIds.includes('accommodation_preference')) {
      return QUESTION_TEMPLATES.accommodation_preference;
    }

    if (answers.budget === 'low' && !answeredIds.includes('accommodation_preference')) {
      return QUESTION_TEMPLATES.accommodation_preference;
    }

    if (!answeredIds.includes('destination_preferences')) {
      return QUESTION_TEMPLATES.destination_preferences;
    }

    // Optional questions
    if (!answeredIds.includes('group_size')) {
      return QUESTION_TEMPLATES.group_size;
    }

    if (!answeredIds.includes('travel_frequency')) {
      return QUESTION_TEMPLATES.travel_frequency;
    }

    if (!answeredIds.includes('climate_preference')) {
      return QUESTION_TEMPLATES.climate_preference;
    }

    if (!answeredIds.includes('duration_preference')) {
      return QUESTION_TEMPLATES.duration_preference;
    }

    // Check if we have enough information
    if (this.hasEnoughData(answers)) {
      return null; // Form complete
    }

    return null;
  }

  hasEnoughData(answers: Record<string, any>): boolean {
    const required = ['travel_type', 'budget', 'interests'];
    const hasRequired = required.every(key => answers[key] !== undefined);
    
    // Ensure we have at least 5 questions answered
    return hasRequired && Object.keys(answers).length >= 5;
  }

  extractPreferences(answers: Record<string, any>): any {
    const preferences: any = {};

    if (answers.travel_type) {
      preferences.travel_type = answers.travel_type;
    }

    if (answers.budget) {
      preferences.budget = answers.budget;
    }

    if (answers.interests) {
      preferences.interests = Array.isArray(answers.interests) 
        ? answers.interests 
        : [answers.interests];
    }

    if (answers.accommodation_preference) {
      preferences.accommodation_preference = answers.accommodation_preference;
    }

    if (answers.destination_preferences) {
      preferences.destination_preferences = Array.isArray(answers.destination_preferences)
        ? answers.destination_preferences
        : [answers.destination_preferences];
    }

    if (answers.group_size) {
      preferences.group_size = answers.group_size;
    }

    if (answers.travel_frequency) {
      preferences.travel_frequency = answers.travel_frequency;
    }

    if (answers.climate_preference) {
      preferences.climate_preference = answers.climate_preference;
    }

    if (answers.duration_preference) {
      preferences.duration_preference = answers.duration_preference;
    }

    return preferences;
  }
}

