import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Unite, UniteSchema } from './entities/unite.entity';
import { UniteService } from './unite.service';
import { UniteController } from './unite.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Unite.name, schema: UniteSchema }]),
  ],
  controllers: [UniteController],
  providers: [UniteService],
  exports: [UniteService],
})
export class UniteModule {}
