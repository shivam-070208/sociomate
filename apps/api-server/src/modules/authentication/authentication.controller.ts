import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
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
  @ApiOperation({
    summary: "Verify email OTP",
    description:
      "Validates the 6-digit OTP sent to the user's email. On success it marks the email as verified and returns a short-lived OTP-verified token used to authorize the password-reset endpoint.",
  })
  @ApiCreatedResponse({
    description:
      "OTP verified. Returns a confirmation message and the OTP-verified token (valid for 2 minutes).",
  })
  @ApiBadRequestResponse({
    description: "Email, OTP not found/expired, or the OTP is invalid.",
  })
  public async verifyOtp(
    @Param("email") email: string,
    @Body() verifyOtpDto: VerifyOtpDto,
  ) {
    return await this.authenticationService.verifyOtp(email, verifyOtpDto);
  }

  @Post("/otp")
  @ApiOperation({
    summary: "Resend OTP",
    description:
      "Regenerates a fresh 6-digit OTP for the user's email, invalidating any previously active OTPs, and publishes it for delivery.",
  })
  @ApiCreatedResponse({ description: "OTP resent successfully." })
  @ApiBadRequestResponse({ description: "User or email account not found." })
  public async resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    return await this.authenticationService.resendOtp(resendOtpDto);
  }

  @Get("/me")
  @UseGuards(AuthGuard)
  @ApiBearerAuth("access-token")
  @ApiOperation({
    summary: "Get current user profile",
    description:
      "Returns the authenticated session and user profile for the supplied access token.",
  })
  @ApiOkResponse({
    description: "The authenticated user's session and profile.",
  })
  @ApiUnauthorizedResponse({ description: "Missing or invalid access token." })
  public getProfile() {
    return this.authenticationService.getProfile();
  }

  @Post("/register")
  @ApiOperation({
    summary: "Register a new user",
    description:
      "Creates a user account from email + password, triggers an OTP email for verification, and returns access/refresh tokens. The email is verified via the OTP verify endpoint.",
  })
  @ApiCreatedResponse({
    description:
      "User created, OTP dispatched, and access + refresh tokens returned.",
  })
  @ApiBadRequestResponse({
    description: "Missing email/password or invalid payload.",
  })
  public async registerUser(@Body() registerUserDto: RegisterUserDto) {
    return await this.authenticationService.registerUser(registerUserDto);
  }

  @Post("/login")
  @ApiOperation({
    summary: "Login with email & password",
    description:
      "Authenticates the user with email and password and returns a fresh pair of access and refresh tokens.",
  })
  @ApiCreatedResponse({
    description: "User authenticated; access and refresh tokens returned.",
  })
  @ApiBadRequestResponse({
    description:
      "Invalid credentials, or the user has no password set (use password reset).",
  })
  public async login(@Body() loginUserDto: LoginUserDto) {
    return await this.authenticationService.loginUser(loginUserDto);
  }

  @Post("/password/reset")
  @ApiBearerAuth("otp-verify-token")
  @UseGuards(OtpVerifyGuard)
  @ApiOperation({
    summary: "Reset password",
    description:
      "Sets a new password for the OTP-verified user. Protected by the short-lived OTP-verified token sent in the 'OTPVefiedToken' header.",
  })
  @ApiCreatedResponse({
    description: "Password updated; user can log in with the new credentials.",
  })
  @ApiBadRequestResponse({
    description: "Missing new password or invalid request.",
  })
  @ApiUnauthorizedResponse({
    description: "Missing or invalid OTP-verify token.",
  })
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
