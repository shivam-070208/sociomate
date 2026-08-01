import { AuthenticationService } from "@/modules/authentication/authentication.service";
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { UserInfoProvider } from "../providers/userinfo.provider";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly userInfoProvider: UserInfoProvider,
    private readonly authenticationService: AuthenticationService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request: Request = context.switchToHttp().getRequest();
    const headers = request.headers;
    const authToken = (headers["authorization"] as string)?.split(" ")[1];
    if (!authToken) {
      return false;
    }

    const session = await this.authenticationService.validateToken(authToken);
    if (!session) {
      return false;
    }

    this.userInfoProvider.setUser(session);
    return true;
  }
}
