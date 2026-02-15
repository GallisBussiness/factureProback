import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Unite, UniteDocument } from './entities/unite.entity';
import { CreateUniteDto } from './dto/create-unite.dto';
import { UpdateUniteDto } from './dto/update-unite.dto';

@Injectable()
export class UniteService {
  private readonly logger = new Logger(UniteService.name);

  constructor(
    @InjectModel(Unite.name)
    private readonly uniteModel: Model<UniteDocument>,
  ) {}

  async create(dto: CreateUniteDto): Promise<UniteDocument> {
    const unite = new this.uniteModel(dto);
    return await unite.save();
  }

  async findAll(): Promise<UniteDocument[]> {
    return this.uniteModel
      .find()
      .sort({ nom: 1 })
      .lean() as unknown as UniteDocument[];
  }

  async findOne(id: string): Promise<UniteDocument> {
    const unite = await this.uniteModel.findById(id).lean();
    if (!unite) {
      throw new NotFoundException(`Unité #${id} introuvable`);
    }
    return unite as UniteDocument;
  }

  async update(id: string, dto: UpdateUniteDto): Promise<UniteDocument> {
    const unite = await this.uniteModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true })
      .lean();
    if (!unite) {
      throw new NotFoundException(`Unité #${id} introuvable`);
    }
    return unite as UniteDocument;
  }

  async remove(id: string): Promise<void> {
    const result = await this.uniteModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Unité #${id} introuvable`);
    }
  }
}
