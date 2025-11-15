// Local types that extend shared types
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}
