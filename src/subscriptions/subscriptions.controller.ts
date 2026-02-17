import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { SubscriptionsService } from './services/subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { PaytechIpnPayload } from './services/paytech.service';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  // ─── Plans ───

  // @Post('plans')
  // createPlan(@Body() dto: CreatePlanDto) {
  //   return this.subscriptionsService.createPlan(dto);
  // }

  @AllowAnonymous()
  @Get('plans')
  findAllPlans() {
    return this.subscriptionsService.findAllPlans();
  }

  @Get('plans/:id')
  findPlan(@Param('id') id: string) {
    return this.subscriptionsService.findPlan(id);
  }

  // @Patch('plans/:id')
  // updatePlan(@Param('id') id: string, @Body() dto: UpdatePlanDto) {
  //   return this.subscriptionsService.updatePlan(id, dto);
  // }

  // @Delete('plans/:id')
  // removePlan(@Param('id') id: string) {
  //   return this.subscriptionsService.removePlan(id);
  // }

  // ─── Subscriptions ───

  @Post('subscribe')
  subscribe(@Body() dto: CreateSubscriptionDto) {
    return this.subscriptionsService.subscribe(dto);
  }

  @Get('user/:userId')
  findUserSubscriptions(@Param('userId') userId: string) {
    return this.subscriptionsService.findUserSubscriptions(userId);
  }

  @Get('user/:userId/active')
  getActiveSubscription(@Param('userId') userId: string) {
    return this.subscriptionsService.getActiveSubscription(userId);
  }

  @Get(':id')
  findSubscription(@Param('id') id: string) {
    return this.subscriptionsService.findSubscription(id);
  }

  // ─── Payments ───

  @AllowAnonymous()
  @Get('payments/user/:userId')
  getUserPayments(@Param('userId') userId: string) {
    return this.subscriptionsService.getUserPayments(userId);
  }

  @AllowAnonymous()
  @Get('payments/ref/:ref')
  getPaymentByRef(@Param('ref') ref: string) {
    return this.subscriptionsService.getPaymentByRef(ref);
  }

  // ─── PayTech IPN Webhook ───

  @AllowAnonymous()
  @Post('ipn')
  handleIpn(@Body() payload: PaytechIpnPayload) {
    return this.subscriptionsService.handleIpn(payload);
  }
}
