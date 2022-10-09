import { ApiProperty } from "@nestjs/swagger";
import { User } from "src/auth/entities/user.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { ProductImage } from './product-image.entity';

@Entity({ name: "products" })
export class Product {

    @ApiProperty({
        example: "915b4503-9929-4c4f-bbc3-151800067674",
        description: "Product ID",
        uniqueItems: true
    })
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ApiProperty({
        example: "T-Shirt Teslo",
        description: "Product Title",
        uniqueItems: true
    })
    @Column("text", {
        unique: true,
    })
    title: string;

    @ApiProperty({
        example: 0,
        description: "Product price",
    })
    @ApiProperty()
    @Column("float", {
        default: 0
    })
    price: number;

    @ApiProperty({
        example: "anim reprehenderi nulla in anim mollit minim irure commodo.",
        description: "Product description",
        default: null
    })
    @ApiProperty()
    @Column({
        type: "text",
        nullable: true
    })
    description: string;

    @ApiProperty({
        example: "t_shirt_teslo",
        description: "Product SLUG - for SEO",
        default: null
    })
    @Column("text", {
        unique: true
    })
    slug: string;

    @ApiProperty({
        example: 10,
        description: "Product stock",
        default: 0
    })
    @Column("int", {
        default: 0
    })
    stock: number;

    @ApiProperty({
        example: ["M", "XL", "XXL"],
        description: "Product sizes",
    })
    @Column("text", {
        array: true
    })
    sizes: string[];

    @ApiProperty()
    @Column("text")
    gender: string;

    @ApiProperty()
    @Column("text", {
        array: true,
        default: []
    })
    tags: string[];

    @ManyToOne(
        () => User,
        (user) => user.product,
        { eager: true }
    )
    user: User

    @ApiProperty()
    @OneToMany(
        () => ProductImage,
        (productImage) => productImage.product,
        { cascade: true, eager: true }
    )

    images?: ProductImage[];


    @BeforeInsert()
    checkSlugInsert() {
        if (!this.slug) {
            this.slug = this.title;
        }
        this.slug = this.slug.toLowerCase().replaceAll(" ", "_").replaceAll("'", "");
    }

    @BeforeUpdate()
    checkSlugUpdate() {
        this.slug = this.slug
            .toLowerCase()
            .replaceAll(" ", "_")
            .replaceAll("'", "")
    }

}
