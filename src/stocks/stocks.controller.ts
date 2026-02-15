import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { StocksService } from './stocks.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { QueryStockMovementDto } from './dto/query-stock-movement.dto';

@Controller('stocks')
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}

  @Post('movements')
  createMovement(@Body() dto: CreateStockMovementDto) {
    return this.stocksService.createMovement(dto);
  }

  @Get('movements')
  findAll(@Query() query: QueryStockMovementDto) {
    return this.stocksService.findAll(query);
  }

  @Get('movements/product/:produitId')
  getByProduct(@Param('produitId') produitId: string) {
    return this.stocksService.getMovementsByProduct(produitId);
  }
}
