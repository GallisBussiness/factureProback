import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { nanoid } from '../common/utils/nanoid.util';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async create(dto: CreateProductDto): Promise<ProductDocument> {
    try {
      const reference = `PRD-${nanoid(10)}`;
      const product = new this.productModel({ ...dto, reference });
      return await product.save();
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictException(
          'Un produit avec cette référence existe déjà',
        );
      }
      throw error;
    }
  }

  async findAll(
    query: QueryProductDto,
  ): Promise<PaginatedResult<ProductDocument>> {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};

    if (query.search) {
      filter.$or = [
        { nom: { $regex: query.search, $options: 'i' } },
        { reference: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
      ];
    }

    if (query.actif !== undefined) {
      filter.actif = query.actif === 'true';
    }

    if (query.stockBas === 'true') {
      filter.$expr = { $lte: ['$quantiteStock', '$seuilAlerte'] };
    }

    const [data, total] = await Promise.all([
      this.productModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate('unite')
        .lean(),
      this.productModel.countDocuments(filter),
    ]);

    return {
      data: data as ProductDocument[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<ProductDocument> {
    const product = await this.productModel
      .findById(id)
      .populate('unite')
      .lean();
    if (!product) {
      throw new NotFoundException(`Produit #${id} introuvable`);
    }
    return product as ProductDocument;
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductDocument> {
    const product = await this.productModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true })
      .populate('unite')
      .lean();
    if (!product) {
      throw new NotFoundException(`Produit #${id} introuvable`);
    }
    return product as ProductDocument;
  }

  async remove(id: string): Promise<void> {
    const result = await this.productModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Produit #${id} introuvable`);
    }
  }

  async updateStock(id: string, quantite: number): Promise<ProductDocument> {
    const product = await this.productModel
      .findByIdAndUpdate(
        id,
        { $inc: { quantiteStock: quantite } },
        { new: true },
      )
      .populate('unite')
      .lean();
    if (!product) {
      throw new NotFoundException(`Produit #${id} introuvable`);
    }
    return product as ProductDocument;
  }

  async getStockAlerts(): Promise<ProductDocument[]> {
    return this.productModel
      .find({
        $expr: { $lte: ['$quantiteStock', '$seuilAlerte'] },
        actif: true,
      })
      .populate('unite')
      .lean() as unknown as ProductDocument[];
  }
}
