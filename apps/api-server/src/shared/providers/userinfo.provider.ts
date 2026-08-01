import { User } from "@repo/db";

export class UserInfoProvider {
  private user: User | undefined;

  setUser(user: User) {
    this.user = user;
  }

  getUser(): User | undefined {
    return this.user;
  }
}
