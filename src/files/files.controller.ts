import { Controller, Get, Post, Param, UploadedFile, UseInterceptors, BadRequestException, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { FilesService } from './files.service';
import { fileFilter, fileNamer } from './helpers';

@ApiTags("File - Get an Upload")
@Controller('files')
export class FilesController {
  constructor(
    private readonly configService: ConfigService,
    private readonly filesService: FilesService) { }

  @Get("product/:imageName")
  findProductImage(
    @Res() res: Response,
    @Param("imageName") imageName: string
  ) {
    const path = this.filesService.getStaticProductImage(imageName);

    res.sendFile(path);

  }

  @Post("product")
  @UseInterceptors(FileInterceptor("file", {
    fileFilter: fileFilter,
    storage: diskStorage({
      destination: "./static/products",
      filename: fileNamer
    })
  }))
  uploadPrductImage(
    @UploadedFile() file: Express.Multer.File
  ) {

    if (!file) {
      throw new BadRequestException("Make sure that the file is an image");
    }
    // const secureUrl = `${file.filename}`;
    const secureUrl = `${this.configService.get("HOST_API")}/files/product/${file.filename}`;


    return {
      secureUrl
    }
  }

}
