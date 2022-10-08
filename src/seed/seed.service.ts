import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';
import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';
import * as bcrypt from 'bcrypt';


@Injectable()
export class SeedService {

  constructor(
    private readonly productsService: ProductsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) { }

  async runSeed() {
    await this.deleteTables();
    const adminUser = await this.inserUsers();
    await this.insertNewProducts(adminUser);
    return "SEED EXECUTED";
  }

  private async deleteTables() {
    await this.productsService.deleteAllProducts();

    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder
      .delete()
      .where({})
      .execute()
  }

  private async inserUsers() {
    const seedUsers = initialData.users;

    const users: User[] = [];

    seedUsers.forEach(user => {
      users.push(this.userRepository.create(user));
    });

    seedUsers.forEach(userDb => {
      userDb.password = bcrypt.hashSync(userDb.password, 10);
    });

    const dbUsers = await this.userRepository.save(seedUsers);

    return dbUsers[0];

  }


  private async insertNewProducts(adminUser: User) {
    await this.productsService.deleteAllProducts();

    const productos = initialData.products;

    const insertPromises = [];

    productos.forEach(producto => {
      insertPromises.push(this.productsService.create(producto, adminUser));
    });

    await Promise.all(insertPromises);

    return true;
  }

}
