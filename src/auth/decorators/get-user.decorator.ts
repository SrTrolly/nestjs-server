import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';



export const GetUser = createParamDecorator(
    (data: string, ctx: ExecutionContext) => {
        const req = ctx.switchToHttp().getRequest();
        // const user = req.user;

        let user: any;
        switch (data) {
            case "email":
                user = req.user.email;
                break;
        }

        if (!data) {
            user = req.user;
        }


        if (!user) {
            throw new InternalServerErrorException("User not found (request)");
        }

        return user;
    }
);