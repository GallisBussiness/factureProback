import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './lib/auth';
import { ClientsModule } from './clients/clients.module';
import { ProductsModule } from './products/products.module';
import { StocksModule } from './stocks/stocks.module';
import { InvoicesModule } from './invoices/invoices.module';
import { UniteModule } from './unite/unite.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // no need to import into other modules
    }),
    MongooseModule.forRootAsync({
      useFactory: async (config: ConfigService) => ({
        uri: config.get('MONGODB_URL'),
        autoCreate: true,
      }),
      inject: [ConfigService],
    }),
    AuthModule.forRoot({
      auth,
      // Fix pour Express 5: le pattern /*path met req.url=/ et req.baseUrl=full_path
      // Ce middleware restaure req.url au chemin complet avant le handler
      middleware: (req, _res, next) => {
        req.url = req.originalUrl;
        req.baseUrl = '';
        next();
      },
    }),
    ClientsModule,
    ProductsModule,
    StocksModule,
    InvoicesModule,
    UniteModule,
    SubscriptionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
