import { Controller, ParseUUIDPipe } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/Common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  //@Post()
  @MessagePattern({cmd: 'create_product'})
  create(@Payload() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  //@Get()
  @MessagePattern({cmd: 'find_all'})
  findAll(@Payload() paginationDto: PaginationDto) {
    return this.productsService.findAll(paginationDto);
  }

  //@Get(':id')
  @MessagePattern({cmd: 'find_one_product'})
  findOne(@Payload('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  //@Patch(':id')
  @MessagePattern({cmd: 'update_product'})
  update(
  // @Param('id', ParseUUIDPipe) id: string, 
  // @Body() updateProductDto: UpdateProductDto
  @Payload() updateProductDto: UpdateProductDto
  ) {
    return this.productsService.update(updateProductDto.id, updateProductDto);
  }

  //@Delete(':id')
  @MessagePattern({cmd: 'delete_product'})
  remove(
    // @Param('id', ParseUUIDPipe) id: string
    @Payload('id', ParseUUIDPipe) id: string
    ) {
    return this.productsService.remove(id);
  }

  @MessagePattern({cmd: 'validate_product'})
  validateProduct(@Payload() ids: string[]){
    return this.productsService.validateProducts(ids);
  }
}
