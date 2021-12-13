import { Request, Response, NextFunction } from 'express'
import AppError from '../shared/error/AppError'

function globalErrors(err: Error, request: Request, response: Response, next: NextFunction) {

  if (err instanceof AppError) {
    response.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      data: err?.data
    });
  }

  console.error(err);

  return response.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });

}

export { globalErrors };