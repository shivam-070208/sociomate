import { AuthenticationService } from "@/modules/authentication/authentication.service";
import { CanActivate, ExecutionContext } from "@nestjs/common";
import { UserInfoProvider } from "../providers/userinfo.provider";
import { User } from "@repo/db";

export class AuthGuard implements CanActivate {
  constructor(
    private readonly userInfoProvider: UserInfoProvider,
    private readonly authenticationService: AuthenticationService,
  ) {}
  canActivate(context: ExecutionContext) {
    const request: Request = context.switchToHttp().getRequest();
    const headers = request.headers;
    const authToken = (headers["authorization"] as string)?.split(" ")[1];
    if (!authToken) {
      return false;
    }
    const userInfo = this.authenticationService.validateToken(authToken);

    if (!userInfo) {
      return false;
    }

    this.userInfoProvider.setUser(userInfo as unknown as User);

    return true;
  }
}
