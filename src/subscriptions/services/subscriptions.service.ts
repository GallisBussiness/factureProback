import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import {
  Subscription,
  SubscriptionDocument,
  SubscriptionStatus,
} from '../schemas/subscription.schema';
import {
  SubscriptionPlan,
  SubscriptionPlanDocument,
  PlanDuration,
} from '../schemas/subscription-plan.schema';
import {
  Payment,
  PaymentDocument,
  PaymentStatus,
} from '../schemas/payment.schema';
import { PaytechService, PaytechIpnPayload } from './paytech.service';
import { CreateSubscriptionDto } from '../dto/create-subscription.dto';
import { CreatePlanDto } from '../dto/create-plan.dto';
import { UpdatePlanDto } from '../dto/update-plan.dto';
import { nanoid } from '../../common/utils/nanoid.util';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectModel(Subscription.name)
    private readonly subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel(SubscriptionPlan.name)
    private readonly planModel: Model<SubscriptionPlanDocument>,
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
    private readonly paytechService: PaytechService,
    private readonly configService: ConfigService,
  ) {}

  // ─── Plans CRUD ───

  async createPlan(dto: CreatePlanDto): Promise<SubscriptionPlanDocument> {
    const plan = new this.planModel(dto);
    return plan.save();
  }

  async findAllPlans(): Promise<SubscriptionPlanDocument[]> {
    return this.planModel
      .find({ actif: true })
      .sort({ prix: 1 })
      .lean() as unknown as SubscriptionPlanDocument[];
  }

  async findPlan(id: string): Promise<SubscriptionPlanDocument> {
    const plan = await this.planModel.findById(id).lean();
    if (!plan) {
      throw new NotFoundException(`Plan #${id} introuvable`);
    }
    return plan as SubscriptionPlanDocument;
  }

  async updatePlan(
    id: string,
    dto: UpdatePlanDto,
  ): Promise<SubscriptionPlanDocument> {
    const plan = await this.planModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true })
      .lean();
    if (!plan) {
      throw new NotFoundException(`Plan #${id} introuvable`);
    }
    return plan as SubscriptionPlanDocument;
  }

  async removePlan(id: string): Promise<void> {
    const result = await this.planModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Plan #${id} introuvable`);
    }
  }

  // ─── Subscriptions ───

  private calculateEndDate(startDate: Date, duree: PlanDuration): Date {
    const end = new Date(startDate);
    switch (duree) {
      case PlanDuration.MONTHLY:
        end.setMonth(end.getMonth() + 1);
        break;
      case PlanDuration.QUARTERLY:
        end.setMonth(end.getMonth() + 3);
        break;
      case PlanDuration.YEARLY:
        end.setFullYear(end.getFullYear() + 1);
        break;
    }
    return end;
  }

  async subscribe(
    dto: CreateSubscriptionDto,
  ): Promise<{ subscription: SubscriptionDocument; redirectUrl: string }> {
    const plan = await this.planModel.findById(dto.planId);
    if (!plan) {
      throw new NotFoundException(`Plan #${dto.planId} introuvable`);
    }

    const refCommand = `SUB-${nanoid(12)}`;
    const now = new Date();
    const dateFin = this.calculateEndDate(now, plan.duree);

    const subscription = new this.subscriptionModel({
      userId: 'admin',
      planId: new Types.ObjectId(dto.planId),
      statut: SubscriptionStatus.PENDING,
      dateDebut: now,
      dateFin,
      refCommand,
    });
    await subscription.save();

    const payment = new this.paymentModel({
      subscriptionId: subscription._id,
      userId: 'admin',
      montant: plan.prix,
      devise: plan.devise,
      statut: PaymentStatus.PENDING,
      refCommand,
      env: this.configService.get<string>('PAYTECH_ENV', 'test'),
    });
    await payment.save();

    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
    const backendUrl = this.configService.getOrThrow<string>('BACKEND_URL');

    const paytechResponse = await this.paytechService.requestPayment({
      item_name: `Abonnement ${plan.nom}`,
      item_price: plan.prix,
      currency: plan.devise,
      ref_command: refCommand,
      command_name: `Abonnement ${plan.nom} - ${plan.duree}`,
      env: this.configService.get<string>('PAYTECH_ENV', 'test'),
      ipn_url: `${backendUrl}/subscriptions/ipn`,
      success_url: `${frontendUrl}/admin/abonnements/success?ref=${refCommand}`,
      cancel_url: `${frontendUrl}/admin/abonnements/cancel?ref=${refCommand}`,
      custom_field: JSON.stringify({
        userId: 'admin',
        subscriptionId: subscription._id.toString(),
      }),
    });
    subscription.paytechToken = paytechResponse.token;
    await subscription.save();

    payment.paytechToken = paytechResponse.token;
    await payment.save();

    return {
      subscription,
      redirectUrl: paytechResponse.redirect_url,
    };
  }

  async handleIpn(payload: PaytechIpnPayload): Promise<void> {
    const isValid = this.paytechService.verifyIpn(payload);
    if (!isValid) {
      throw new NotFoundException('Signature IPN invalide');
    }

    const payment = await this.paymentModel.findOne({
      refCommand: payload.ref_command,
    });
    if (!payment) {
      throw new NotFoundException(
        `Paiement ref ${payload.ref_command} introuvable`,
      );
    }

    if (payload.type_event === 'sale_complete') {
      payment.statut = PaymentStatus.COMPLETED;
      payment.typeEvent = payload.type_event;
      payment.paymentMethod = payload.payment_method;
      payment.clientPhone = payload.client_phone;
      await payment.save();

      const subscription = await this.subscriptionModel.findById(
        payment.subscriptionId,
      );
      if (subscription) {
        subscription.statut = SubscriptionStatus.ACTIVE;
        subscription.paymentMethod = payload.payment_method;
        await subscription.save();
      }
    } else if (payload.type_event === 'sale_canceled') {
      payment.statut = PaymentStatus.CANCELLED;
      payment.typeEvent = payload.type_event;
      await payment.save();

      const subscription = await this.subscriptionModel.findById(
        payment.subscriptionId,
      );
      if (subscription) {
        subscription.statut = SubscriptionStatus.CANCELLED;
        await subscription.save();
      }
    }
  }

  async findUserSubscriptions(userId: string): Promise<SubscriptionDocument[]> {
    return this.subscriptionModel
      .find({ userId })
      .populate('planId')
      .sort({ createdAt: -1 })
      .lean() as unknown as SubscriptionDocument[];
  }

  async getActiveSubscription(
    userId: string,
  ): Promise<SubscriptionDocument | null> {
    const sub = await this.subscriptionModel
      .findOne({
        userId,
        statut: SubscriptionStatus.ACTIVE,
        dateFin: { $gte: new Date() },
      })
      .populate('planId')
      .lean();
    return sub as SubscriptionDocument | null;
  }

  async findSubscription(id: string): Promise<SubscriptionDocument> {
    const sub = await this.subscriptionModel
      .findById(id)
      .populate('planId')
      .lean();
    if (!sub) {
      throw new NotFoundException(`Abonnement #${id} introuvable`);
    }
    return sub as SubscriptionDocument;
  }

  async getUserPayments(userId: string): Promise<PaymentDocument[]> {
    return this.paymentModel
      .find({ userId })
      .populate('subscriptionId')
      .sort({ createdAt: -1 })
      .lean() as unknown as PaymentDocument[];
  }

  async getPaymentByRef(refCommand: string): Promise<PaymentDocument> {
    const payment = await this.paymentModel
      .findOne({ refCommand })
      .populate('subscriptionId')
      .lean();
    if (!payment) {
      throw new NotFoundException(`Paiement ref ${refCommand} introuvable`);
    }
    return payment as PaymentDocument;
  }
}
