import { Model } from "mongoose"
import { Result } from "src/common/Domain/result-handler/Result"
import { PaginationDto } from "src/common/Infraestructure/dto/entry/pagination.dto"
import { OdmNotificationAlertEntity } from "../../entities/odm-entities/odm-notification-alert.entity"

export interface NotiAlert {
    alert_id: string, 
    user_id: string, 
    title: string,
    body: string,
    date: Date,
    user_readed: boolean,
}

export class OdmNotificationAlertRepository {

    private readonly notiModel: Model<OdmNotificationAlertEntity>
    constructor ( notiModel: Model<OdmNotificationAlertEntity>) {
        this.notiModel = notiModel
    }
    
    async findManyNotificationsByIdUser(userId: string, pagDto: PaginationDto): Promise<Result<OdmNotificationAlertEntity[]>> {
        try {
            const {page, perPage} = pagDto
            const noti = await this.notiModel.find( { "user_id": userId } ).skip(page).limit(perPage)
            return Result.success<OdmNotificationAlertEntity[]>( noti, 200 )
        } catch (error) {
            return Result.fail<OdmNotificationAlertEntity[]>( error, 500, "Internal Server Error" )
        }
    }
    
    async saveNotificationAlert( data: NotiAlert ) {
        const noti = new this.notiModel(data)
        await this.notiModel.create( noti )
    }
    
    async findNotificationById(user_id: string, notification_id: string): Promise<Result<OdmNotificationAlertEntity>> {
        try {
            const noti = await this.notiModel.findOne( { "user_id": user_id, "alert_id": notification_id } )
            return Result.success<OdmNotificationAlertEntity>( noti, 200 )
        } catch (error) {
            return Result.fail<OdmNotificationAlertEntity>( error, 500, "Internal Server Error" )
        }
    }
    
    async findAllByIdUserNotReaded(user_id: string): Promise<Result<OdmNotificationAlertEntity[]>> {
        try {
            const noti = await this.notiModel.find( { "user_id": user_id, "user_readed": false } )
            console.log(noti)
            return Result.success<OdmNotificationAlertEntity[]>( noti, 200 )
        } catch (error) {
            return Result.fail<OdmNotificationAlertEntity[]>( error, 500, "Internal Server Error" )
        }
    }

}