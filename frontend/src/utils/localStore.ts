import { v4 } from 'uuid';

const userId = 'userId';
const userName = 'userName';

export default class LocalStore {
  static SaveUser() {
    if (!localStorage.getItem(userId)) {
      localStorage.setItem(userId, v4() || '');
    }
  }

  static GetUser() {
    return localStorage.getItem(userId) as string;
  }

  static SaveName(name: string) {
    localStorage.setItem(userName, name);
  }

  static GetName() {
    return localStorage.getItem(userName) as string;
  }
}
