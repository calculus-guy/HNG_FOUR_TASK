declare namespace Express {
  export interface Request {
    correlation_id?: string;
  }
}