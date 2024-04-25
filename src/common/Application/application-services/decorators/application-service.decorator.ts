import { Result } from "../../result-handler/Result"
import { IApplicationService } from "../application-service.interface"



export abstract class ApplicationServiceDecorator<D, R> implements IApplicationService<D, R>
{

    protected applicationService: IApplicationService<D, R>

    constructor ( applicationService: IApplicationService<D, R> )
    {
        this.applicationService = applicationService
    }

    get name (): string
    {
        return this.applicationService.name
    }

    execute ( data: D ): Promise<Result<R>>
    {
        return this.applicationService.execute( data )
    }

}