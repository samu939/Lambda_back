import { ApplicationServiceEntryDto } from "src/common/Application/application-services/dto/application-service-entry.dto"




export interface SearchBlogByTitleEntryDto extends ApplicationServiceEntryDto
{
    title: string
}