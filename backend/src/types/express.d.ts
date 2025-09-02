import type { UserPayload } from '../auth/types'; // 👈 adjust path if needed

declare global {
  namespace Express {
    interface Request {
      user?: JwtUser;
    }
  }
}
