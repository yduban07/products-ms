import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { PaginationDto } from 'src/Common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('Products');

  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected')
  }
  create(createProductDto: CreateProductDto) {
     const id = uuidv4();
    return this.product.create({
      data: {
        id,
        ...createProductDto}
    })
  }

  async findAll(paginationDto: PaginationDto) {
    const {page, limit} = paginationDto;

    const totalPages =  await this.product.count({where: {available: true}});
    const lastPage = Math.ceil(totalPages/limit);

    return {
      data: await this.product.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {available: true}
      }),
      meta: {
        total: totalPages,
        page,
        lastPage,
      }
    }
  }

  async findOne(id: string) {
    const product =  await this.product.findFirst({
      where: {id, available: true}
    });

    if(!product){
      throw new RpcException({
        message: `Product with id ${id} not found`,
        status: HttpStatus.NOT_FOUND,
      });
    }
    
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    
    const {id:__, ...data} = updateProductDto;
    await this.findOne(id);

    return await this.product.update({
      where:{id},
      data: data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.product.update({
      where: { id },
      data: {
        available: false
      }
    });
  }

  async validateProducts(ids: string[]) {
    ids = Array.from(new Set(ids));

    const products = await this.product.findMany({
      where: {
        id: {
          in: ids
        }
      }
    });

    if(products.length !== ids.length){

      throw new RpcException({
        message: `Some products were not found`,
        status: HttpStatus.BAD_REQUEST,
      });
    }

    return products;
  }
}
