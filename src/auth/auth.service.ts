import { Injectable, BadRequestException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from "bcrypt"
import { CreateUserDto, LoginUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) { }

  async create(createUserDto: CreateUserDto) {

    try {

      const { password, ...userDate } = createUserDto

      const user = this.userRepository.create({
        ...userDate,
        password: bcrypt.hashSync(password, 10)
      });

      await this.userRepository.save(user);
      delete user.password;

      return {
        ...user,
        token: this.getJwtToken({ id: user.id })
      }

    } catch (error) {
      this.handleDbError(error);
    }

  }

  async login(loginUserDto: LoginUserDto) {

    const { email, password } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true }
    });

    console.log("usuario encontrado", user);

    if (!user) {
      throw new UnauthorizedException("Credentials are not valid (email)");
    }

    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException("Credential are not valid (password)");
    }

    return {
      ...user,
      token: this.getJwtToken({ id: user.id })
    };
    //TODO: retornar el JWT de acceso

  }

  async checkAuthStatus(user: User) {

    // const userDB = await this.userRepository.findOneBy({ id: userId }); // Esta linea esta demas ya que el usuario esta verificado, para no sobrecargar el DB

    return {
      ...user,
      token: this.getJwtToken({ id: user.id })
    }
  }

  private getJwtToken(payload: JwtPayload) {

    const token = this.jwtService.sign(payload);

    return token;
  }


  private handleDbError(error: any): void {
    if (error.code === "23505") {
      throw new BadRequestException(error.detail);
    }

    console.log(error);
    throw new InternalServerErrorException("Please check server logs");
  }


}
