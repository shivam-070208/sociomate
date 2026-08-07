import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

interface OtpVerifiedJwtPayload {
  sub: string;
  otpVerified: boolean;
}

interface OtpRequest extends Request {
  useremail?: string;
}

@Injectable()
export class OtpVerifyGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<OtpRequest>();

    const otpVerifiedToken = request.headers["otpvefiedtoken"];

    if (typeof otpVerifiedToken !== "string") {
      return false;
    }

    try {
      const decoded =
        await this.jwtService.verifyAsync<OtpVerifiedJwtPayload>(
          otpVerifiedToken,
        );

      if (!decoded.sub || !decoded.otpVerified) {
        return false;
      }

      request.useremail = decoded.sub;

      return true;
    } catch {
      return false;
    }
  }
}
