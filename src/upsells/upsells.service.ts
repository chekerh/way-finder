import { Injectable } from '@nestjs/common';

export interface UpsellProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  commissionRate: number;
  imageUrl?: string;
  features: string[];
  recommended: boolean;
}

@Injectable()
export class UpsellsService {
  /**
   * Get available upsell products for a destination
   */
  async getUpsellProducts(
    destinationId?: string,
    dates?: string,
  ): Promise<UpsellProduct[]> {
    // In production, fetch from external APIs or database
    // For now, return mock data
    return [
      {
        id: 'travel_insurance_1',
        name: 'Assurance Voyage Complète',
        description:
          'Protection complète pour votre voyage avec annulation, bagages et assistance médicale',
        price: 29.99,
        currency: 'EUR',
        category: 'travel_insurance',
        commissionRate: 18.0,
        recommended: true,
        features: [
          'Annulation',
          'Bagages',
          'Assistance médicale',
          'Rapatriement',
        ],
      },
      {
        id: 'airport_transfer_1',
        name: 'Transfert Aéroport',
        description:
          "Transfert privé aller-retour entre l'aéroport et votre hôtel",
        price: 45.0,
        currency: 'EUR',
        category: 'airport_transfer',
        commissionRate: 12.0,
        recommended: false,
        features: [
          'Aller-retour',
          'Conducteur professionnel',
          'Suivi en temps réel',
        ],
      },
      {
        id: 'car_rental_1',
        name: 'Location de Voiture',
        description: 'Voiture économique avec assurance complète pour 7 jours',
        price: 199.0,
        currency: 'EUR',
        category: 'car_rental',
        commissionRate: 15.0,
        recommended: false,
        features: ['Assurance complète', 'Kilométrage illimité', 'GPS inclus'],
      },
      {
        id: 'lounge_access_1',
        name: 'Accès Salon Aéroport',
        description: 'Accès au salon VIP avec repas, boissons et WiFi gratuit',
        price: 35.0,
        currency: 'EUR',
        category: 'lounge_access',
        commissionRate: 25.0,
        recommended: true,
        features: [
          'Repas inclus',
          'Boissons illimitées',
          'WiFi gratuit',
          'Confort',
        ],
      },
      {
        id: 'wifi_data_1',
        name: 'Forfait Internet Voyage',
        description: '10GB de données 4G/5G valable dans 50+ pays',
        price: 19.99,
        currency: 'EUR',
        category: 'wifi_data',
        commissionRate: 35.0,
        recommended: true,
        features: [
          '10GB de données',
          '50+ pays',
          'Vitesse 4G/5G',
          'Valable 30 jours',
        ],
      },
      {
        id: 'seat_selection_1',
        name: 'Sélection de Siège',
        description:
          "Choisissez votre siège à l'avance (fenêtre, couloir, ou siège premium)",
        price: 15.0,
        currency: 'EUR',
        category: 'seat_selection',
        commissionRate: 8.0,
        recommended: false,
        features: ['Choix du siège', "Réservation à l'avance", "Plus d'espace"],
      },
    ];
  }
}
