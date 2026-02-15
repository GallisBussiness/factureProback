import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UniteService } from './unite.service';
import { CreateUniteDto } from './dto/create-unite.dto';
import { UpdateUniteDto } from './dto/update-unite.dto';

@Controller('unite')
export class UniteController {
  constructor(private readonly uniteService: UniteService) {}

  @Post()
  create(@Body() dto: CreateUniteDto) {
    return this.uniteService.create(dto);
  }

  @Get()
  findAll() {
    return this.uniteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.uniteService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUniteDto) {
    return this.uniteService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.uniteService.remove(id);
  }
}
