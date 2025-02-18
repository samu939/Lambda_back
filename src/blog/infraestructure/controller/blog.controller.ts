import { BadRequestException, Body, Controller, Get, Inject, Logger, Param, ParseUUIDPipe, Post, Query, UseGuards } from "@nestjs/common"
import { ExceptionDecorator } from "src/common/Application/application-services/decorators/decorators/exception-decorator/exception.decorator"
import { LoggingDecorator } from "src/common/Application/application-services/decorators/decorators/logging-decorator/logging.decorator"
import { DataSource } from "typeorm"
import { NativeLogger } from "src/common/Infraestructure/logger/logger"
import { OrmBlogRepository } from "../repositories/orm-repositories/orm-blog-repository"
import { OrmBlogMapper } from "../mappers/orm-mappers/orm-blog-mapper"
import { OrmBlogCommentMapper } from "../mappers/orm-mappers/orm-blog-comment-mapper"
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger"
import { GetBlogSwaggerResponseDto } from "../dto/response/get-blog-swagger-response.dto"
import { SearchBlogsSwaggerResponseDto } from "../dto/response/search-blogs-swagger-response.dto"
import { OrmAuditingRepository } from "src/common/Infraestructure/auditing/repositories/orm-repositories/orm-auditing-repository"
import { JwtAuthGuard } from "src/auth/infraestructure/jwt/decorator/jwt-auth.guard"
import { GetUser } from "src/auth/infraestructure/jwt/decorator/get-user.param.decorator"
import { SearchBlogQueryParametersDto } from "../dto/queryParameters/search-blog-query-parameters.dto"
import { CreateBlogEntryDto } from "../dto/entry/create-blog-entry.dto"
import { CreateBlogApplicationService } from "src/blog/application/services/commands/create-blog-application.service"
import { IdGenerator } from "src/common/Application/Id-generator/id-generator.interface"
import { UuidGenerator } from "src/common/Infraestructure/id-generator/uuid-generator"
import { AuditingDecorator } from "src/common/Application/application-services/decorators/decorators/auditing-decorator/auditing.decorator"
import { AzureFileUploader } from "src/common/Infraestructure/azure-file-uploader/azure-file-uploader"
import { HttpExceptionHandler } from "src/common/Infraestructure/http-exception-handler/http-exception-handler"
import { OdmBlogRepository } from "../repositories/odm-repository/odm-blog-repository"
import { BlogCreated } from "src/blog/domain/events/blog-created-event"
import { Model } from "mongoose"
import { OdmBlogEntity } from "../entities/odm-entities/odm-blog.entity"
import { InjectModel } from "@nestjs/mongoose"
import { OdmCategoryEntity } from "src/categories/infraesctructure/entities/odm-entities/odm-category.entity"
import { OdmTrainerEntity } from "src/trainer/infraestructure/entities/odm-entities/odm-trainer.entity"
import { SearchRecentBlogsByCategoryService } from "../query-services/services/search-recent-blogs-by-category.service"
import { SearchBlogsByCategoryServiceEntryDto } from "../query-services/dto/params/search-blogs-by-category-service-entry.dto"
import { SearchMostPopularBlogsByCategoryService } from "../query-services/services/search-most-popular-blogs-by-category.service"
import { SearchBlogsByTrainerServiceEntryDto } from "../query-services/dto/params/search-blogs-by-trainer-service-entry.dto"
import { SearchMostPopularBlogsByTrainerService } from "../query-services/services/search-most-popular-blogs-by-trainer.service"
import { SearchRecentBlogsByTrainerService } from "../query-services/services/search-recent-blogs-by-trainer.service"
import { OdmBlogCommentEntity } from "../entities/odm-entities/odm-blog-comment.entity"
import { OdmUserEntity } from "src/user/infraestructure/entities/odm-entities/odm-user.entity"
import { GetBlogService } from "../query-services/services/get-blog.service"
import { BlogQuerySyncronizer } from '../query-synchronizer/blog-query-synchronizer'
import { OdmCategoryRepository } from "src/categories/infraesctructure/repositories/odm-repositories/odm-category-repository"
import { GetBlogCountQueryParametersDto } from "../dto/queryParameters/get-blog-count-query-parameters.dto"
import { GetBlogCountService } from "../query-services/services/get-blog-count.service"
import { OdmTrainerRepository } from '../../../trainer/infraestructure/repositories/odm-repositories/odm-trainer-repository'
import { RabbitEventBus } from "src/common/Infraestructure/rabbit-event-bus/rabbit-event-bus"
import { OdmNotificationAddressEntity } from "src/notification/infraestructure/entities/odm-entities/odm-notification-address.entity"
import { OdmNotificationAlertEntity } from "src/notification/infraestructure/entities/odm-entities/odm-notification-alert.entity"
import { FirebaseNotifier } from "src/notification/infraestructure/notifier/firebase-notifier-singleton"
import { INotificationAddressRepository } from "src/notification/infraestructure/repositories/interface/notification-address-repository.interface"
import { INotificationAlertRepository } from "src/notification/infraestructure/repositories/interface/notification-alert-repository.interface"
import { OdmNotificationAddressRepository } from "src/notification/infraestructure/repositories/odm-notification-address-repository"
import { OdmNotificationAlertRepository } from "src/notification/infraestructure/repositories/odm-notification-alert-repository"
import { NewPublicationPushInfraService } from "src/notification/infraestructure/service/notification-service/new-publication-notification-service"
import { OrmTrainerRepository } from '../../../trainer/infraestructure/repositories/orm-repositories/orm-trainer-repository'
import { OrmCategoryRepository } from "src/categories/infraesctructure/repositories/orm-repositories/orm-category-repository"
import { OrmCategoryMapper } from "src/categories/infraesctructure/mappers/orm-mappers/orm-category-mapper"
import { OrmTrainerMapper } from "src/trainer/infraestructure/mappers/orm-mapper/orm-trainer-mapper"
import { PerformanceDecorator } from "src/common/Application/application-services/decorators/decorators/performance-decorator/performance.decorator"
import { ImageTransformer } from "src/common/Infraestructure/image-helper/image-transformer"
import { GetCountResponseDto } from "src/common/Infraestructure/dto/responses/get-count-response.dto"


@ApiTags( 'Blog' )
@Controller( 'blog' )
export class BlogController
{
    private readonly notiAddressRepository: INotificationAddressRepository
    private readonly notiAlertRepository: INotificationAlertRepository
    private readonly blogRepository: OrmBlogRepository
    private readonly auditingRepository: OrmAuditingRepository
    private readonly odmBlogRepository: OdmBlogRepository
    private readonly odmTrainerRepository: OdmTrainerRepository
    private readonly ormTrainerRepository: OrmTrainerRepository
    private readonly ormCategoryRepository: OrmCategoryRepository
    private readonly eventBus = RabbitEventBus.getInstance();
    private readonly imageTransformer: ImageTransformer
    private readonly odmCategoryRepository: OdmCategoryRepository
    private readonly idGenerator: IdGenerator<string>
    private readonly fileUploader: AzureFileUploader
    private readonly blogQuerySyncronizer: BlogQuerySyncronizer
    private readonly logger: Logger = new Logger( "CourseController" )
    constructor ( 
        @InjectModel('NotificationAddress') private addressModel: Model<OdmNotificationAddressEntity>,
        @InjectModel('NotificationAlert') private alertModel: Model<OdmNotificationAlertEntity>,
        @Inject( 'DataSource' ) private readonly dataSource: DataSource,
        @InjectModel('Blog') private blogModel: Model<OdmBlogEntity>,
        @InjectModel('Category') private categoryModel: Model<OdmCategoryEntity>,
        @InjectModel('Trainer') private trainerModel: Model<OdmTrainerEntity>,
        @InjectModel('BlogComment') private blogCommentModel: Model<OdmBlogCommentEntity>,
        @InjectModel('User') private userModel: Model<OdmUserEntity>)
    {
        this.imageTransformer = new ImageTransformer()
        this.notiAddressRepository = new OdmNotificationAddressRepository( addressModel )
        this.notiAlertRepository = new OdmNotificationAlertRepository( alertModel )
        this.blogRepository =
            new OrmBlogRepository(
                new OrmBlogMapper(),
                new OrmBlogCommentMapper(),
                dataSource
            )
        this.auditingRepository = new OrmAuditingRepository( dataSource )
        this.idGenerator = new UuidGenerator()
        this.fileUploader = new AzureFileUploader()

        this.odmBlogRepository = new OdmBlogRepository(
            blogModel,
            blogCommentModel
        )

        this.odmTrainerRepository = new OdmTrainerRepository( this.trainerModel, this.userModel )
        this.odmCategoryRepository = new OdmCategoryRepository( this.categoryModel )
        this.blogQuerySyncronizer = new BlogQuerySyncronizer(
            this.odmBlogRepository,
            this.blogModel,
            this.odmCategoryRepository,
            this.odmTrainerRepository
        )

        this.ormCategoryRepository = new OrmCategoryRepository( new OrmCategoryMapper(), dataSource )
        this.ormTrainerRepository = new OrmTrainerRepository( new OrmTrainerMapper() ,dataSource )
        
    }


    @Post( 'create' )
    @UseGuards( JwtAuthGuard )
    @ApiBearerAuth()
    @ApiOkResponse( { description: 'Crea un blog' } )
    async createBlog (@GetUser() user, @Body() createBlogParams: CreateBlogEntryDto )
    {

        const service =
            new ExceptionDecorator(
                new AuditingDecorator(
                    new LoggingDecorator(
                        new PerformanceDecorator(
                            new CreateBlogApplicationService(
                                this.blogRepository,
                                this.idGenerator,
                                this.fileUploader,
                                this.eventBus,
                                this.ormTrainerRepository,
                                this.ormCategoryRepository
                            ),
                        new NativeLogger( this.logger )
                    ),
                        new NativeLogger( this.logger )
                    ),
                    this.auditingRepository,
                    this.idGenerator
                ),
                new HttpExceptionHandler()
            )
        
        const newImages: File[] = []
        for ( const image of createBlogParams.images ){
            let newImage: File
            try{
                newImage = await this.imageTransformer.base64ToFile(image)
            } catch (error){
                throw new BadRequestException("Las imagenes deben ser en formato base64")
            }
            newImages.push(newImage)
           
        }
        const result = await service.execute( { images: newImages, 
            userId: user.id, 
            trainerId: createBlogParams.trainerId,
            title: createBlogParams.title,
            body: createBlogParams.body,
            categoryId: createBlogParams.categoryId,
            tags: createBlogParams.tags} )
        this.eventBus.subscribe('BlogCreated', async (event: BlogCreated) => {
            this.blogQuerySyncronizer.execute(event)
            const pushService = new NewPublicationPushInfraService(
                this.notiAddressRepository,
                this.notiAlertRepository,
                this.idGenerator,
                FirebaseNotifier.getInstance() ,
                this.odmTrainerRepository
            )
            pushService.execute( { userId:'', publicationName: event.title, trainerId: event.trainerId, publicationType: 'Blog' } )
        
        })
        return 
    }


    @Get( 'one/:id' )
    @UseGuards( JwtAuthGuard )
    @ApiBearerAuth()
    @ApiOkResponse( { description: 'Devuelve la informacion de un blog dado el id', type: GetBlogSwaggerResponseDto } )
    async getBlog ( @Param( 'id', ParseUUIDPipe ) id: string, @GetUser() user )
    {
        const service =
            new ExceptionDecorator(
                new LoggingDecorator(
                    new PerformanceDecorator(
                        new GetBlogService(
                            this.odmBlogRepository
                        ),
                        new NativeLogger( this.logger )
                    ),
                new NativeLogger( this.logger )
                ),
                new HttpExceptionHandler()
            )
        const result = await service.execute( { blogId: id, userId: user.id } )
        return result.Value
    }

    @Get( 'many' )
    @UseGuards( JwtAuthGuard )
    @ApiBearerAuth()
    @ApiOkResponse( { description: 'Devuelve la informacion de los blogs', type: SearchBlogsSwaggerResponseDto, isArray: true } )
    async searchBlogs ( @GetUser() user, @Query() searchBlogParams: SearchBlogQueryParametersDto )
    {

        if ( ( searchBlogParams.category || ( !searchBlogParams.category && !searchBlogParams.trainer ) ) )
        {
            const searchBlogServiceEntry: SearchBlogsByCategoryServiceEntryDto = { categoryId: searchBlogParams.category, userId: user.id, pagination: { page: searchBlogParams.page, perPage: searchBlogParams.perPage } }

            if ( searchBlogParams.filter == 'POPULAR' )
            {
                const service =
                    new ExceptionDecorator(
                        new LoggingDecorator(
                            new PerformanceDecorator(
                                new SearchMostPopularBlogsByCategoryService(
                                    this.odmBlogRepository
                                ),
                                new NativeLogger( this.logger )
                            ),
                            new NativeLogger( this.logger )
                        ),
                        new HttpExceptionHandler()
                    )
                const result = await service.execute( searchBlogServiceEntry )

                return result.Value
            } else
            {
                const service =
                    new ExceptionDecorator(
                        new LoggingDecorator(
                            new PerformanceDecorator(
                                new SearchRecentBlogsByCategoryService(
                                    this.odmBlogRepository
                                ),
                                new NativeLogger( this.logger )
                            ),
                            new NativeLogger( this.logger )
                        ),
                        new HttpExceptionHandler()
                    )
                const result = await service.execute( searchBlogServiceEntry )

                return result.Value
            }

        }

        const searchBlogServiceEntry: SearchBlogsByTrainerServiceEntryDto = { trainerId: searchBlogParams.trainer, userId: user.id, pagination: { page: searchBlogParams.page, perPage: searchBlogParams.perPage } }

        if ( searchBlogParams.filter == 'POPULAR' )
        {
            const service =
                new ExceptionDecorator(
                    new LoggingDecorator(
                        new PerformanceDecorator(
                            new SearchMostPopularBlogsByTrainerService(
                                this.odmBlogRepository
                            ),
                            new NativeLogger( this.logger )
                        ),
                        new NativeLogger( this.logger )
                    ),
                    new HttpExceptionHandler()
                )
            const result = await service.execute( searchBlogServiceEntry )

            return result.Value
        } else
        {
            const service =
                new ExceptionDecorator(
                    new LoggingDecorator(
                        new PerformanceDecorator(
                            new SearchRecentBlogsByTrainerService(
                                this.odmBlogRepository
                            ),
                            new NativeLogger( this.logger )
                        ),
                        new NativeLogger( this.logger )
                    ),
                    new HttpExceptionHandler()
                )
            const result = await service.execute( searchBlogServiceEntry )

            return result.Value
        }


    }

    @Get( 'count' )
    @UseGuards( JwtAuthGuard )
    @ApiBearerAuth()
    @ApiOkResponse( { description: 'Devuelve la cantidad de blogs', type: GetCountResponseDto } )
    async getBlogcount ( @GetUser() user, @Query() getBlogCountParams: GetBlogCountQueryParametersDto )
    {
        const service =
            new ExceptionDecorator(
                new LoggingDecorator(
                    new PerformanceDecorator(
                        new GetBlogCountService(
                            this.odmBlogRepository
                        ),
                        new NativeLogger( this.logger )
                    ),
                    new NativeLogger( this.logger )
                ),
                new HttpExceptionHandler()
            )
        if (!getBlogCountParams.category && !getBlogCountParams.trainer){
            throw new BadRequestException("tiene que enviar o un entrenador o una categoria")
        }
        const result = await service.execute( {...getBlogCountParams, userId: user.id})
        return {count: result.Value}
    }

}