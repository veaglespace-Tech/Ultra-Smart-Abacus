import { apiHelper } from './apiHelper';
import { storageService } from './storage.services';

export async function login(email, password) {
  try {
    const resData = await apiHelper.post('/auth/login', { email, password });
    const { token, user } = resData;
    
    // Save token and user in localStorage
    storageService.setToken(token);
    storageService.setUser(user);
    
    return user;
  } catch (error) {
    const message = error.message || "Invalid credentials. Please try again.";
    throw new Error(message);
  }
}
