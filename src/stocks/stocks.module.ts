import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  StockMovement,
  StockMovementSchema,
} from './schemas/stock-movement.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { StocksService } from './stocks.service';
import { StocksController } from './stocks.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StockMovement.name, schema: StockMovementSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [StocksController],
  providers: [StocksService],
  exports: [StocksService],
})
export class StocksModule {}
