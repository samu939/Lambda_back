import { ApplicationServiceEntryDto } from '../../../common/Application/application-services/dto/application-service-entry.dto';

export class GetNotificationsUserDtoEntryAplicationDto implements ApplicationServiceEntryDto {
    userId: string;
    page: number
    perPage: number
}