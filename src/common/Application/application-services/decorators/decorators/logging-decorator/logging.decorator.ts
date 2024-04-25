import { Result } from "src/common/Application/result-handler/Result"
import { IApplicationService } from "../../../application-service.interface"
import { ApplicationServiceDecorator } from "../../application-service.decorator"
import { ILogger } from "src/common/Application/logger/logger.interface"
import { LoggerDto } from "src/common/Application/logger/dto/logs.dto"



export class LoggingDecorator<D, R> extends ApplicationServiceDecorator<D, R>
{

    private readonly logger: ILogger;

    constructor ( applicationService: IApplicationService<D, R>, logger: ILogger)
    {
        super( applicationService )
        this.logger = logger
    }

    async execute ( data: D ): Promise<Result<R>>
    {
        const result = await super.execute( data )
        const toLog: LoggerDto = {
            data: data,
            name: this.name
        }
        if (result.isSuccess())
            this.logger.SuccessLog( toLog )
        else
            this.logger.FailLog( toLog )
        return result
    }

}