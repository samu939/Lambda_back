import { Result } from "src/common/Application/result-handler/Result"
import { Course } from "../course"
import { Section } from "../entities/section"
import { SectionComment } from "../entities/section-comment"
import { PaginationDto } from "src/common/Infraestructure/dto/entry/pagination.dto"



export interface ICourseRepository
{

    findCourseById ( id: string ): Promise<Result<Course>>
    findCoursesByName ( name: string, pagination: PaginationDto ): Promise<Result<Course[]>>
    findCourseSections ( id: string, pagination: PaginationDto ): Promise<Result<Section[]>>
    addCommentToSection ( comment: SectionComment ): Promise<Result<SectionComment>>
    //suponiendo que esto se vaya a hacer por separado de los blogs
    findCoursesByCategory ( categoryId: string, pagination: PaginationDto ): Promise<Result<Course[]>>
    findSectionById ( sectionId: string ): Promise<Result<Section>>
    findSectionComments ( sectionId: string, pagination: PaginationDto ): Promise<Result<SectionComment[]>>
    findAllTrainerCourses ( trainerId: string, pagination: PaginationDto ): Promise<Result<Course[]>>

}