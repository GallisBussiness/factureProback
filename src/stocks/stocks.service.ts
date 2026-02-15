import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  StockMovement,
  StockMovementDocument,
  MovementType,
} from './schemas/stock-movement.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { QueryStockMovementDto } from './dto/query-stock-movement.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';

@Injectable()
export class StocksService {
  constructor(
    @InjectModel(StockMovement.name)
    private readonly movementModel: Model<StockMovementDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async createMovement(
    dto: CreateStockMovementDto,
  ): Promise<StockMovementDocument> {
    const product = await this.productModel.findById(dto.produitId);
    if (!product) {
      throw new NotFoundException(`Produit #${dto.produitId} introuvable`);
    }

    const quantiteAvant = product.quantiteStock;
    let quantiteApres: number;

    switch (dto.type) {
      case MovementType.ENTREE:
        quantiteApres = quantiteAvant + dto.quantite;
        break;
      case MovementType.SORTIE:
        if (quantiteAvant < dto.quantite) {
          throw new BadRequestException(
            `Stock insuffisant. Disponible: ${quantiteAvant}, Demandé: ${dto.quantite}`,
          );
        }
        quantiteApres = quantiteAvant - dto.quantite;
        break;
      case MovementType.AJUSTEMENT:
        quantiteApres = dto.quantite;
        break;
      default:
        throw new BadRequestException('Type de mouvement invalide');
    }

    product.quantiteStock = quantiteApres;
    await product.save();

    const movement = new this.movementModel({
      produitId: new Types.ObjectId(dto.produitId),
      type: dto.type,
      quantite: dto.quantite,
      quantiteAvant,
      quantiteApres,
      motif: dto.motif,
    });
    return await movement.save();
  }

  async findAll(
    query: QueryStockMovementDto,
  ): Promise<PaginatedResult<StockMovementDocument>> {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '20', 10);
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};

    if (query.produitId) {
      filter.produitId = new Types.ObjectId(query.produitId);
    }

    if (query.type) {
      filter.type = query.type;
    }

    const [data, total] = await Promise.all([
      this.movementModel
        .find(filter)
        .populate('produitId', 'reference nom')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      this.movementModel.countDocuments(filter),
    ]);

    return {
      data: data as StockMovementDocument[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getMovementsByProduct(
    produitId: string,
  ): Promise<StockMovementDocument[]> {
    return this.movementModel
      .find({ produitId: new Types.ObjectId(produitId) })
      .sort({ createdAt: -1 })
      .lean() as unknown as StockMovementDocument[];
  }

  async createInvoiceMovement(
    produitId: string,
    quantite: number,
    factureId: string,
  ): Promise<StockMovementDocument> {
    const product = await this.productModel.findById(produitId);
    if (!product) {
      throw new NotFoundException(`Produit #${produitId} introuvable`);
    }

    if (product.quantiteStock < quantite) {
      throw new BadRequestException(
        `Stock insuffisant pour ${product.nom}. Disponible: ${product.quantiteStock}, Demandé: ${quantite}`,
      );
    }

    const quantiteAvant = product.quantiteStock;
    const quantiteApres = quantiteAvant - quantite;

    product.quantiteStock = quantiteApres;
    await product.save();

    const movement = new this.movementModel({
      produitId: new Types.ObjectId(produitId),
      type: MovementType.SORTIE,
      quantite,
      quantiteAvant,
      quantiteApres,
      motif: `Facture ${factureId}`,
      factureId: new Types.ObjectId(factureId),
    });

    return await movement.save();
  }
}
