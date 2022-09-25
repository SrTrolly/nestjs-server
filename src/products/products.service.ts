import { NotFoundException } from '@nestjs/common';
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Logger } from '@nestjs/common/services';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { validate as isUuid } from "uuid"


@Injectable()
export class ProductsService {

  private readonly logger = new Logger("ProductsService");

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) { }

  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save(product);

      return product;

    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {

    const { limit = 10, offset = 0 } = paginationDto;
    const productos = await this.productRepository.find({
      take: limit,
      skip: offset
    });
    return productos;
  }

  async findOne(term: string) {

    let producto: Product;

    if (isUuid(term)) {
      producto = await this.productRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder();
      producto = await queryBuilder
        .where(`UPPER(title) =:title or slug=:slug`, {
          title: term.toUpperCase(),
          slug: term.toLowerCase()
        }).getOne();
    }

    // const producto = await this.productRepository.findOneBy({ id })
    if (!producto) {
      throw new NotFoundException(`Producot with id ${term} not found`);
    }
    return producto;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const producto = await this.productRepository.preload({
      id: id,
      ...updateProductDto
    });

    if (!producto) throw new NotFoundException(`Producto with id: ${id} not found`);

    try {
      await this.productRepository.save(producto);
      return producto
    } catch (error) {
      this.handleDBExceptions(error);
    }


  }

  async remove(id: string) {
    const producto = await this.productRepository.findOneBy({ id });
    await this.productRepository.remove(producto);
  }


  private handleDBExceptions(error: any) {
    if (error.code === "23505") {
      throw new BadRequestException(error.detail);
    }
    this.logger.error(error);
    throw new InternalServerErrorException("Unexpected error, check server logs")
  }


}
