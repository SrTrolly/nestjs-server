import { createParamDecorator, ExecutionContext } from "@nestjs/common";



export const RawHeaders = createParamDecorator(
    (data: string, cdx: ExecutionContext) => {


        const req = cdx.switchToHttp().getRequest();
        const header = req.rawHeaders
        console.log({ header })
        return header;
    }
)