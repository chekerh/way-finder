import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PriceAlert, PriceAlertDocument } from './price-alerts.schema';
import { CreatePriceAlertDto, UpdatePriceAlertDto } from './price-alerts.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PriceAlertsService {
  constructor(
    @InjectModel(PriceAlert.name)
    private readonly priceAlertModel: Model<PriceAlertDocument>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createPriceAlert(
    userId: string,
    createPriceAlertDto: CreatePriceAlertDto,
  ): Promise<PriceAlert> {
    // Check if user already has an active alert for this item
    const existingAlert = await this.priceAlertModel
      .findOne({
        userId,
        alertType: createPriceAlertDto.alertType,
        itemId: createPriceAlertDto.itemId,
        isActive: true,
      })
      .exec();

    if (existingAlert) {
      // Update existing alert instead of creating duplicate
      Object.assign(existingAlert, {
        targetPrice: createPriceAlertDto.targetPrice,
        condition: createPriceAlertDto.condition || 'below',
        currentPrice:
          createPriceAlertDto.currentPrice ?? existingAlert.currentPrice,
        expiresAt: createPriceAlertDto.expiresAt
          ? new Date(createPriceAlertDto.expiresAt)
          : existingAlert.expiresAt,
        sendNotification: createPriceAlertDto.sendNotification ?? true,
        sendEmail: createPriceAlertDto.sendEmail ?? false,
        isTriggered: false,
        triggeredAt: null,
      });
      const savedAlert = await existingAlert.save();
      return savedAlert;
    }

    const priceAlert = new this.priceAlertModel({
      userId,
      ...createPriceAlertDto,
      condition: createPriceAlertDto.condition || 'below',
      currentPrice: createPriceAlertDto.currentPrice ?? null,
      expiresAt: createPriceAlertDto.expiresAt
        ? new Date(createPriceAlertDto.expiresAt)
        : null,
      isActive: true,
      isTriggered: false,
      sendNotification: createPriceAlertDto.sendNotification ?? true,
      sendEmail: createPriceAlertDto.sendEmail ?? false,
    });

    const savedAlert = await priceAlert.save();
    return savedAlert;
  }

  /**
   * Get user price alerts (non-paginated - for backward compatibility)
   * @deprecated Use getUserPriceAlertsPaginated instead for better performance
   */
  async getUserPriceAlerts(
    userId: string,
    activeOnly: boolean = false,
  ): Promise<PriceAlert[]> {
    const query: any = { userId };
    if (activeOnly) {
      query.isActive = true;
      query.$or = [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }];
    }

    return this.priceAlertModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .exec();
  }

  /**
   * Get paginated user price alerts
   * @param userId - User ID
   * @param page - Page number (1-based)
   * @param limit - Items per page
   * @param activeOnly - Filter to active alerts only
   * @returns Paginated price alert results
   */
  async getUserPriceAlertsPaginated(
    userId: string,
    page: number,
    limit: number,
    activeOnly: boolean = false,
  ) {
    const query: any = { userId };
    if (activeOnly) {
      query.isActive = true;
      query.$or = [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }];
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.priceAlertModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.priceAlertModel.countDocuments(query).exec(),
    ]);

    return { data, total };
  }

  async getPriceAlert(userId: string, alertId: string): Promise<PriceAlert> {
    const alert = await this.priceAlertModel
      .findOne({ _id: alertId, userId })
      .exec();

    if (!alert) {
      throw new NotFoundException('Price alert not found');
    }

    return alert;
  }

  async updatePriceAlert(
    userId: string,
    alertId: string,
    updateDto: UpdatePriceAlertDto,
  ): Promise<PriceAlert> {
    const alert = await this.priceAlertModel
      .findOne({ _id: alertId, userId })
      .exec();

    if (!alert) {
      throw new NotFoundException('Price alert not found');
    }

    Object.assign(alert, {
      ...updateDto,
      expiresAt: updateDto.expiresAt
        ? new Date(updateDto.expiresAt)
        : alert.expiresAt,
    });

    // If updating target price, reset trigger status
    if (updateDto.targetPrice !== undefined) {
      alert.isTriggered = false;
      alert.triggeredAt = null;
    }

    const savedAlert = await alert.save();
    return savedAlert;
  }

  async deletePriceAlert(userId: string, alertId: string): Promise<void> {
    const result = await this.priceAlertModel
      .deleteOne({ _id: alertId, userId })
      .exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException('Price alert not found');
    }
  }

  async deactivatePriceAlert(
    userId: string,
    alertId: string,
  ): Promise<PriceAlert> {
    const alert = await this.priceAlertModel
      .findOne({ _id: alertId, userId })
      .exec();

    if (!alert) {
      throw new NotFoundException('Price alert not found');
    }

    alert.isActive = false;
    const savedAlert = await alert.save();
    return savedAlert;
  }

  // Monitoring service methods
  async checkPriceAlert(
    alert: PriceAlertDocument,
    currentPrice: number,
  ): Promise<boolean> {
    // Check if alert is expired
    if (alert.expiresAt && alert.expiresAt < new Date()) {
      alert.isActive = false;
      await alert.save();
      return false;
    }

    // Check if alert condition is met
    const shouldTrigger =
      alert.condition === 'below'
        ? currentPrice <= alert.targetPrice
        : currentPrice >= alert.targetPrice;

    if (shouldTrigger && alert.isActive) {
      // Update alert
      alert.isTriggered = true;
      alert.triggeredAt = new Date();
      alert.triggerCount += 1;
      alert.currentPrice = currentPrice;

      // Send notification if enabled
      if (alert.sendNotification) {
        const priceChange = alert.currentPrice
          ? ((currentPrice - alert.currentPrice) / alert.currentPrice) * 100
          : 0;

        const message =
          alert.condition === 'below'
            ? `Le prix pour ${alert.itemData.name || alert.itemId} est maintenant ${currentPrice}${alert.currency} (en dessous de ${alert.targetPrice}${alert.currency})`
            : `Le prix pour ${alert.itemData.name || alert.itemId} est maintenant ${currentPrice}${alert.currency} (au-dessus de ${alert.targetPrice}${alert.currency})`;

        await this.notificationsService.createPriceAlertNotification(
          alert.userId.toString(),
          alert.itemId,
          alert.itemData.name || alert.itemId,
          alert.currentPrice || alert.targetPrice,
          currentPrice,
        );
      }

      await alert.save();
      return true;
    }

    // Update current price even if not triggered
    if (alert.currentPrice !== currentPrice) {
      alert.currentPrice = currentPrice;
      await alert.save();
    }

    return false;
  }

  async checkAllActiveAlerts(): Promise<number> {
    // This would typically be called by a scheduled job/cron
    // For now, it's a placeholder that would integrate with catalog service
    const activeAlerts = await this.priceAlertModel
      .find({
        isActive: true,
        $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
      })
      .exec();

    const triggeredCount = 0;

    for (const alert of activeAlerts) {
      // In a real implementation, you would fetch current price from catalog service
      // For now, this is a placeholder
      // const currentPrice = await this.catalogService.getCurrentPrice(alert.alertType, alert.itemId);
      // if (currentPrice) {
      //   const triggered = await this.checkPriceAlert(alert, currentPrice);
      //   if (triggered) triggeredCount++;
      // }
    }

    return triggeredCount;
  }

  async getActiveAlertsForItem(
    alertType: string,
    itemId: string,
  ): Promise<PriceAlert[]> {
    return this.priceAlertModel
      .find({
        alertType,
        itemId,
        isActive: true,
        $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
      })
      .exec();
  }
}
