import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AuthenticationService } from "./authentication.service";
import { RegisterUserDto } from "./dto/register-user.dto";

@Controller("auth")
@ApiTags("Authentication")
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post("/otp/verify/user/:userId")
  public async verifyOtp() {
    return { message: "OTP verification not implemented yet." };
  }

  @Get("/me")
  public async getProfile() {
    return { message: "Profile endpoint not implemented yet." };
  }

  @Post("/register")
  public async registerUser(@Body() registerUserDto: RegisterUserDto) {
    return this.authenticationService.registerUser(registerUserDto);
  }

  @Post("/login")
  public async login() {
    return { message: "Login endpoint not implemented yet." };
  }

  @Post("/forgotpassword")
  public async forgotPassword() {
    return { message: "Forgot password endpoint not implemented yet." };
  }
}
