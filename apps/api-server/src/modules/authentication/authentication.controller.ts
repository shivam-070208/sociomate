import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuthenticationService } from "./authentication.service";
import { RegisterUserDto } from "./dto/register-user.dto";
import { ResendOtpDto } from "./dto/resend-otp.dto";
import { AuthGuard } from "@/shared/guards/auth.guard";
import { LoginUserDto } from "./dto/login-user.dto";

@Controller("auth")
@ApiTags("Authentication")
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post("/otp/verify/user/:userId")
  public verifyOtp() {
    return { message: "OTP verification not implemented yet." };
  }

  @Post("/otp")
  public async resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    return this.authenticationService.resendOtp(resendOtpDto);
  }

  @Get("/me")
  @UseGuards(AuthGuard)
  @ApiBearerAuth("access-token")
  public getProfile() {
    return this.authenticationService.getProfile();
  }

  @Post("/register")
  public async registerUser(@Body() registerUserDto: RegisterUserDto) {
    return this.authenticationService.registerUser(registerUserDto);
  }

  @Post("/login")
  public async login(@Body() loginUserDto: LoginUserDto) {
    return await this.authenticationService.loginUser(loginUserDto);
  }

  @Post("/forgotpassword")
  public forgotPassword() {
    return { message: "Forgot password endpoint not implemented yet." };
  }
}
