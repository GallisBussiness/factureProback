import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Invoice, InvoiceDocument } from './schemas/invoice.schema';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { QueryInvoiceDto } from './dto/query-invoice.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { numericId } from '../common/utils/nanoid.util';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectModel(Invoice.name)
    private readonly invoiceModel: Model<InvoiceDocument>,
  ) {}

  async create(dto: CreateInvoiceDto): Promise<InvoiceDocument> {
    const numero = numericId(10);

    const lignes: any[] = [];
    for (const ligne of dto.lignes) {
      const total = ligne.prixUnitaire * ligne.quantite;

      lignes.push({
        produitId: new Types.ObjectId(ligne.produitId),
        quantite: ligne.quantite,
        prixUnitaire: ligne.prixUnitaire,
        total: Math.round(total * 100) / 100,
      });
    }

    const total = lignes.reduce((sum: number, l: any) => sum + l.total, 0);

    const invoice = new this.invoiceModel({
      numero,
      clientId: new Types.ObjectId(dto.clientId),
      dateEmission: new Date(dto.dateEmission),
      dateEcheance: new Date(dto.dateEcheance),
      lignes,
      total: Math.round(total * 100) / 100,
      notes: dto.notes,
    });
    return await invoice.save();
  }

  async findAll(
    query: QueryInvoiceDto,
  ): Promise<PaginatedResult<InvoiceDocument>> {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};

    if (query.search) {
      filter.$or = [{ numero: { $regex: query.search, $options: 'i' } }];
    }

    if (query.clientId) {
      filter.clientId = new Types.ObjectId(query.clientId);
    }

    if (query.dateDebut || query.dateFin) {
      filter.dateEmission = {};
      if (query.dateDebut) {
        filter.dateEmission.$gte = new Date(query.dateDebut);
      }
      if (query.dateFin) {
        filter.dateEmission.$lte = new Date(query.dateFin);
      }
    }

    const [data, total] = await Promise.all([
      this.invoiceModel
        .find(filter)
        .populate('clientId', 'nom telephone')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      this.invoiceModel.countDocuments(filter),
    ]);

    return {
      data: data as InvoiceDocument[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<InvoiceDocument> {
    const invoice = await this.invoiceModel
      .findById(id)
      .populate('clientId', 'nom telephone adresse')
      .populate('lignes.produitId', 'reference nom')
      .lean();

    if (!invoice) {
      throw new NotFoundException(`Facture #${id} introuvable`);
    }
    return invoice as InvoiceDocument;
  }

  async findByClient(clientId: string): Promise<InvoiceDocument[]> {
    return this.invoiceModel
      .find({ clientId: new Types.ObjectId(clientId) })
      .sort({ createdAt: -1 })
      .lean() as unknown as InvoiceDocument[];
  }

  async remove(id: string): Promise<void> {
    const result = await this.invoiceModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Facture #${id} introuvable`);
    }
  }
}
