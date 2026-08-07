import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuthenticationService } from "./authentication.service";
import { RegisterUserDto } from "./dto/register-user.dto";
import { ResendOtpDto } from "./dto/resend-otp.dto";
import { VerifyOtpDto } from "./dto/verify-otp.dto";
import { AuthGuard } from "@/shared/guards/auth.guard";
import { LoginUserDto } from "./dto/login-user.dto";
import { OtpVerifyGuard } from "@/shared/guards/otp.verify.guard";
import { ResetPasswordDto } from "./dto/reset-password.dto";

@Controller("auth")
@ApiTags("Authentication")
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post("/otp/verify/email/:email")
  public async verifyOtp(
    @Param("email") email: string,
    @Body() verifyOtpDto: VerifyOtpDto,
  ) {
    return await this.authenticationService.verifyOtp(email, verifyOtpDto);
  }

  @Post("/otp")
  public async resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    return await this.authenticationService.resendOtp(resendOtpDto);
  }

  @Get("/me")
  @UseGuards(AuthGuard)
  @ApiBearerAuth("access-token")
  public getProfile() {
    return this.authenticationService.getProfile();
  }

  @Post("/register")
  public async registerUser(@Body() registerUserDto: RegisterUserDto) {
    return await this.authenticationService.registerUser(registerUserDto);
  }

  @Post("/login")
  public async login(@Body() loginUserDto: LoginUserDto) {
    return await this.authenticationService.loginUser(loginUserDto);
  }

  @Post("/password/reset")
  @ApiBearerAuth("otp-verify-token")
  @UseGuards(OtpVerifyGuard)
  public async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Req() resetPasswordReq: Request,
  ) {
    const userEmail = resetPasswordReq["useremail"] as string;
    return await this.authenticationService.resetPassword(
      resetPasswordDto,
      userEmail,
    );
  }
}
