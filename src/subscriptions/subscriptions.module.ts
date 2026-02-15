import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SubscriptionPlan,
  SubscriptionPlanSchema,
} from './schemas/subscription-plan.schema';
import {
  Subscription,
  SubscriptionSchema,
} from './schemas/subscription.schema';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { PaytechService } from './services/paytech.service';
import { SubscriptionsService } from './services/subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SubscriptionPlan.name, schema: SubscriptionPlanSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: Payment.name, schema: PaymentSchema },
    ]),
  ],
  controllers: [SubscriptionsController],
  providers: [PaytechService, SubscriptionsService],
  exports: [SubscriptionsService, PaytechService],
})
export class SubscriptionsModule {}
