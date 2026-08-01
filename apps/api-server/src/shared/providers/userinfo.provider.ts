import { Injectable, Scope } from "@nestjs/common";
import { User } from "@repo/db";

@Injectable({ scope: Scope.REQUEST })
export class UserInfoProvider {
  private user: User | undefined;

  setUser(user: User) {
    this.user = user;
  }

  getUser(): User | undefined {
    return this.user;
  }
}
