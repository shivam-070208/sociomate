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
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
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
  @ApiOperation({
    summary: "Connect a social account",
    description:
      "Connects a new social account (e.g. Telegram, WhatsApp, Instagram) to the workspace by validating the provider credentials and storing the account. Credentials are never returned in responses.",
  })
  @ApiCreatedResponse({
    description: "Social account connected; safe account data returned.",
  })
  @ApiBadRequestResponse({
    description: "Unsupported provider or invalid payload.",
  })
  @ApiConflictResponse({
    description: "The social account is already connected to this workspace.",
  })
  @ApiUnauthorizedResponse({ description: "Missing or invalid access token." })
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
  @ApiOperation({
    summary: "List connected social accounts",
    description:
      "Returns all social accounts connected to the workspace (sensitive credentials excluded).",
  })
  @ApiOkResponse({
    description: "List of connected social accounts (no credentials).",
  })
  @ApiUnauthorizedResponse({ description: "Missing or invalid access token." })
  public async listSocialAccounts(
    @Param("workspaceslug") workspaceslug: string,
  ) {
    return await this.socialAccountService.listSocialAccounts(
      this.getUserId(),
      workspaceslug,
    );
  }

  @Get("socialaccountid/:socialaccountid")
  @ApiOperation({
    summary: "Get a social account",
    description:
      "Returns a single social account connected to the workspace (sensitive credentials excluded).",
  })
  @ApiOkResponse({ description: "Social account details (no credentials)." })
  @ApiNotFoundResponse({
    description: "Social account not found for this workspace.",
  })
  @ApiUnauthorizedResponse({ description: "Missing or invalid access token." })
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
  @ApiOperation({
    summary: "Update a social account",
    description:
      "Updates the username and/or display name of a connected social account.",
  })
  @ApiOkResponse({ description: "Social account updated." })
  @ApiBadRequestResponse({ description: "Invalid payload." })
  @ApiNotFoundResponse({
    description: "Social account not found for this workspace.",
  })
  @ApiUnauthorizedResponse({ description: "Missing or invalid access token." })
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
  @ApiOperation({
    summary: "Refresh social account credentials",
    description:
      "Renews the access token for the connected social account and returns the new token expiry.",
  })
  @ApiOkResponse({
    description: "Credentials refreshed; new token expiry returned.",
  })
  @ApiBadRequestResponse({ description: "Unsupported provider." })
  @ApiNotFoundResponse({
    description: "Social account not found for this workspace.",
  })
  @ApiUnauthorizedResponse({ description: "Missing or invalid access token." })
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
  @ApiOperation({
    summary: "Disconnect a social account",
    description:
      "Revokes and deletes the connected social account from the workspace.",
  })
  @ApiOkResponse({ description: "Social account disconnected successfully." })
  @ApiNotFoundResponse({
    description: "Social account not found for this workspace.",
  })
  @ApiUnauthorizedResponse({ description: "Missing or invalid access token." })
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
