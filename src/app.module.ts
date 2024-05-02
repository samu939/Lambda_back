import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TestController } from './test/infraestructure/controller/test.controller'
import { ormDatabaseProvider } from './common/Infraestructure/providers/db-providers/db-provider'
import { UserController } from './user/infraestructure/controller/user.controller'
import { CourseController } from './course/infraestructure/controller/courses.controller'
import { BlogController } from './blog/infraestructure/controller/blog.controller'

@Module( {
  imports: [
    ConfigModule.forRoot(),
  ],
  controllers: [ TestController, UserController, CourseController, BlogController],
  providers: [ ormDatabaseProvider ],
} )
export class AppModule { }
