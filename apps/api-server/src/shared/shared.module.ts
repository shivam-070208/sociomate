import { Global, Module } from "@nestjs/common";
import { UserInfoProvider } from "./providers/userinfo.provider";
import { PrismaModule } from "./db/prisma.module";

@Global()
@Module({
  providers: [UserInfoProvider],
  imports: [PrismaModule],
  exports: [UserInfoProvider],
})
export class SharedModule {}
