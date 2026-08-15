import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "@/shared/guards/auth.guard";
import { UserInfoProvider } from "@/shared/providers/userinfo.provider";
import { SocialAccountService } from "../services/social-account.service";
import { ConnectSocialAccountDto } from "../dto/connect-social-account.dto";
import { UpdateSocialAccountDto } from "../dto/update-social-account.dto";

@Controller("workspace/workspaceslug/:workspaceslug/social-account")
@ApiTags("Social Account")
@UseGuards(AuthGuard)
@ApiBearerAuth("access-token")
export class SocialAccountController {
  constructor(
    private readonly socialAccountService: SocialAccountService,
    private readonly userInfoProvider: UserInfoProvider,
  ) {}

  private getUserId(): string {
    const user = this.userInfoProvider.getUser();
    return user!.userId;
  }

  @Post("connect")
  public async connectSocialAccount(
    @Param("workspaceslug") workspaceslug: string,
    @Body() connectSocialAccountDto: ConnectSocialAccountDto,
  ) {
    return await this.socialAccountService.connectSocialAccount(
      this.getUserId(),
      workspaceslug,
      connectSocialAccountDto,
    );
  }

  @Get()
  public async listSocialAccounts(
    @Param("workspaceslug") workspaceslug: string,
  ) {
    return await this.socialAccountService.listSocialAccounts(
      this.getUserId(),
      workspaceslug,
    );
  }

  @Get("socialaccountid/:socialaccountid")
  public async getSocialAccount(
    @Param("workspaceslug") workspaceslug: string,
    @Param("socialaccountid") socialAccountId: string,
  ) {
    return await this.socialAccountService.getSocialAccount(
      this.getUserId(),
      workspaceslug,
      socialAccountId,
    );
  }

  @Patch("socialaccountid/:socialaccountid")
  public async updateSocialAccount(
    @Param("workspaceslug") workspaceslug: string,
    @Param("socialaccountid") socialAccountId: string,
    @Body() updateSocialAccountDto: UpdateSocialAccountDto,
  ) {
    return await this.socialAccountService.updateSocialAccount(
      this.getUserId(),
      workspaceslug,
      socialAccountId,
      updateSocialAccountDto,
    );
  }

  @Post("socialaccountid/:socialaccountid/refresh")
  public async refreshSocialAccount(
    @Param("workspaceslug") workspaceslug: string,
    @Param("socialaccountid") socialAccountId: string,
  ) {
    return await this.socialAccountService.refreshSocialAccount(
      this.getUserId(),
      workspaceslug,
      socialAccountId,
    );
  }

  @Delete("socialaccountid/:socialaccountid")
  public async disconnectSocialAccount(
    @Param("workspaceslug") workspaceslug: string,
    @Param("socialaccountid") socialAccountId: string,
  ) {
    return await this.socialAccountService.disconnectSocialAccount(
      this.getUserId(),
      workspaceslug,
      socialAccountId,
    );
  }
}
