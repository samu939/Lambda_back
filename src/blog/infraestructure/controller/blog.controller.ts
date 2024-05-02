import { Body, Controller, Get, Inject, Logger, Param, ParseUUIDPipe, Post } from "@nestjs/common"
import { ExceptionDecorator } from "src/common/Application/application-services/decorators/decorators/exception-decorator/exception.decorator"
import { LoggingDecorator } from "src/common/Application/application-services/decorators/decorators/logging-decorator/logging.decorator"
import { DataSource } from "typeorm"
import { NativeLogger } from "src/common/Infraestructure/logger/logger"
import { IdGenerator } from "src/common/Application/Id-generator/id-generator.interface"
import { UuidGenerator } from "src/common/Infraestructure/id-generator/uuid-generator"
import { OrmBlogRepository } from "../repositories/orm-repositories/orm-blog-repository"
import { OrmBlogMapper } from "../mappers/orm-mappers/orm-blog-mapper"
import { OrmBlogCommentMapper } from "../mappers/orm-mappers/orm-blog-comment-mapper"
import { GetBlogApplicationService } from "src/blog/application/services/queries/get-blog-application.service"
import { SearchBlogEntryDto } from "../dto/search-blog-entry.dto"
import { SearchBlogByTitleEntryDto } from "src/blog/application/dto/params/search-blog-by-title-entry.dto"
import { SearchBlogByTitleApplicationService } from "src/blog/application/services/queries/search-blog-by-title-application.service"
import { SearchBlogByCategoryEntryDto } from "src/blog/application/dto/params/search-blog-by-category-entry.dto"
import { SearchBlogByCategoryApplicationService } from "src/blog/application/services/queries/search-blog-by-category-application.service"
import { AddCommentToBlogEntryDto } from "../dto/add-comment-to-blog-entry.dto"
import { AddCommentToBlogApplicationService } from "src/blog/application/services/commands/add-comment-to-blog-application.service"


@Controller( 'blog' )
export class BlogController
{

    private readonly blogRepository: OrmBlogRepository
    private readonly idGenerator: IdGenerator<string>
    private readonly logger: Logger = new Logger( "CourseController" )
    constructor ( @Inject( 'DataSource' ) private readonly dataSource: DataSource )
    {
        this.idGenerator = new UuidGenerator()
        this.blogRepository =
            new OrmBlogRepository(
                new OrmBlogMapper(),
                new OrmBlogCommentMapper(),
                dataSource
            )

    }

    @Get( ':id' )
    async getBlog ( @Param( 'id', ParseUUIDPipe ) id: string )
    {
        const service =
            new ExceptionDecorator(
                new LoggingDecorator(
                    new GetBlogApplicationService(
                        this.blogRepository
                    ),
                    new NativeLogger( this.logger )
                )
            )
        const result = await service.execute( { blogId: id, userId: '1' } )
        return result.Value
    }

    @Post( 'search' )
    async searchBlog ( @Body() searchBlogEntryDto: SearchBlogEntryDto )
    {
        const searchBlogServiceEntry: SearchBlogByTitleEntryDto = { ...searchBlogEntryDto, userId: '2'}
        const service =
            new ExceptionDecorator(
                new LoggingDecorator(
                    new SearchBlogByTitleApplicationService(
                        this.blogRepository
                    ),
                    new NativeLogger( this.logger )
                )
            )
        const result = await service.execute( searchBlogServiceEntry )

        return result.Value
    }

    @Get( 'category/:categoryId' )
    async searchCourseByCategory ( @Param('categoryId', ParseUUIDPipe) categoryId: string )
    {
        const searchBlogByCategoryServiceEntry: SearchBlogByCategoryEntryDto = { categoryId, userId: '2'}
        const service =
            new ExceptionDecorator(
                new LoggingDecorator(
                    new SearchBlogByCategoryApplicationService(
                        this.blogRepository
                    ),
                    new NativeLogger( this.logger )
                )
            )
        const result = await service.execute( searchBlogByCategoryServiceEntry )

        return result.Value
    }

    @Post( ':blogId/comment' )
    async addCommentToSection ( @Param( 'blogId', ParseUUIDPipe ) blogId: string, @Body() comment: AddCommentToBlogEntryDto)
    {
        const service =
            new ExceptionDecorator(
                new LoggingDecorator(
                    new AddCommentToBlogApplicationService(
                        this.blogRepository,
                        this.idGenerator
                    ),
                    new NativeLogger( this.logger )
                )
            )

        const data = { ...comment, blogId, userId: 'df0595a1-ba58-47c7-ace6-b3d734b27a66' }
        const result = await service.execute( data )
        return result.Value
    }


}