import type { User } from "@strava-musician-app/shared";
import type { UserDAO } from "../../db/dao/daos/userDao";

export class UserService {
  constructor(private dao: UserDAO) {}

  async getUser(id: string) {
    return await this.dao.findUserById(id);
  }

  async updateUser(id: string, patch: Partial<User>) {
    return await this.dao.updateUser(id, patch);
  }

  async searchUsers(query: string) {
    return await this.dao.searchUsers(query);
  }
}
