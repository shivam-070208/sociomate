import { Injectable, Scope } from "@nestjs/common";
import { Session, User } from "@repo/db";

type SessionWithUser = Session & { user: User };

@Injectable({ scope: Scope.REQUEST })
export class UserInfoProvider {
  private user: SessionWithUser | undefined;

  setUser(user: SessionWithUser) {
    this.user = user;
  }

  getUser(): SessionWithUser | undefined {
    return this.user;
  }
}
