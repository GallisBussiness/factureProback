import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Client, ClientDocument } from './schemas/client.schema';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { QueryClientDto } from './dto/query-client.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';

@Injectable()
export class ClientsService {
  private readonly logger = new Logger(ClientsService.name);

  constructor(
    @InjectModel(Client.name)
    private readonly clientModel: Model<ClientDocument>,
  ) {}

  async create(dto: CreateClientDto): Promise<ClientDocument> {
    try {
      const client = new this.clientModel(dto);
      return await client.save();
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictException('Un client avec cet email existe déjà');
      }
      throw error;
    }
  }

  async findAll(
    query: QueryClientDto,
  ): Promise<PaginatedResult<ClientDocument>> {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};

    if (query.search) {
      filter.$or = [
        { nom: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
        { telephone: { $regex: query.search, $options: 'i' } },
      ];
    }

    if (query.actif !== undefined) {
      filter.actif = query.actif === 'true';
    }

    const [data, total] = await Promise.all([
      this.clientModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      this.clientModel.countDocuments(filter),
    ]);

    return {
      data: data as ClientDocument[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<ClientDocument> {
    const client = await this.clientModel.findById(id).lean();
    if (!client) {
      throw new NotFoundException(`Client #${id} introuvable`);
    }
    return client as ClientDocument;
  }

  async update(id: string, dto: UpdateClientDto): Promise<ClientDocument> {
    const client = await this.clientModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true })
      .lean();
    if (!client) {
      throw new NotFoundException(`Client #${id} introuvable`);
    }
    return client as ClientDocument;
  }

  async remove(id: string): Promise<void> {
    const result = await this.clientModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Client #${id} introuvable`);
    }
  }
}
