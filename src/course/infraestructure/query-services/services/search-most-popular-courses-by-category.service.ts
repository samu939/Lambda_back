import { IProgressCourseRepository } from 'src/progress/domain/repositories/progress-course-repository.interface'
import { IApplicationService } from 'src/common/Application/application-services/application-service.interface'
import { SearchCoursesByCategoryServiceEntryDto } from '../dto/param/search-courses-by-category-service-entry.dto'
import { Result } from 'src/common/Domain/result-handler/Result'
import { SearchCourseServiceResponseDto } from '../dto/responses/search-course-service-response.dto'
import { OdmCourseRepository } from '../../repositories/odm-repositories/odm-course-repository'
import { OdmCourseEntity } from '../../entities/odm-entities/odm-course.entity'


interface CoursePopularity {
    course: OdmCourseEntity
    users: number

}


export class SearchMostPopularCoursesByCategoryService implements IApplicationService<SearchCoursesByCategoryServiceEntryDto, SearchCourseServiceResponseDto[]>{
    private readonly courseRepository: OdmCourseRepository
    private readonly progressRepository: IProgressCourseRepository

    constructor ( courseRepository: OdmCourseRepository, progressRepository: IProgressCourseRepository)
    {
        this.courseRepository = courseRepository
        this.progressRepository = progressRepository


    }
    async execute ( data: SearchCoursesByCategoryServiceEntryDto ): Promise<Result<SearchCourseServiceResponseDto[]>>
    {
        const coursesDict: {[key: string]: CoursePopularity} = {}
        data.pagination.page = data.pagination.page * data.pagination.perPage - data.pagination.perPage
        const courses = await this.courseRepository.findCoursesByCategory( data.categoryId, data.pagination )
        if ( !courses.isSuccess() )
        {
            return Result.fail<SearchCourseServiceResponseDto[]>( courses.Error, courses.StatusCode, courses.Message )
        }

        for ( const course of courses.Value )
        {
            const courseUsers = await this.progressRepository.findUserCountInCourse( course.id )
            console.log(courseUsers.Value)
            if ( !courseUsers.isSuccess() )
            {
                return Result.fail<SearchCourseServiceResponseDto[]>( courseUsers.Error, courseUsers.StatusCode, courseUsers.Message )
            }
            coursesDict[course.id] = {course, users: courseUsers.Value}
        }
        const sortedCourses = Object.values( coursesDict ).sort( ( a, b ) => b.users - a.users ).map( course => course.course )
        const responseCourses: SearchCourseServiceResponseDto[] = []

        for (const course of sortedCourses){
            responseCourses.push({
                id: course.id,
                title: course.name,
                image: course.image,
                date: course.date,
                category: course.category.categoryName,
                trainer: course.trainer.first_name + ' ' + course.trainer.first_last_name + ' ' + course.trainer.second_last_name,
            })
        }

        return Result.success<SearchCourseServiceResponseDto[]>( responseCourses, 200 )
    }
    get name (): string
    {
        return this.constructor.name
    }
}