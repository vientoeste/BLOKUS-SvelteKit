export class CustomError extends Error {
  constructor(message: string, statusCode?: number) {
    super(message);
    this.status = statusCode;
  }
  status?: number;
}
