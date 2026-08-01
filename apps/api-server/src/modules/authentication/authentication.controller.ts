import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuthenticationService } from "./authentication.service";
import { RegisterUserDto } from "./dto/register-user.dto";
import { AuthGuard } from "@/shared/guards/auth.guard";

@Controller("auth")
@ApiTags("Authentication")
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post("/otp/verify/user/:userId")
  public verifyOtp() {
    return { message: "OTP verification not implemented yet." };
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
  public login() {
    return { message: "Login endpoint not implemented yet." };
  }

  @Post("/forgotpassword")
  public forgotPassword() {
    return { message: "Forgot password endpoint not implemented yet." };
  }
}
