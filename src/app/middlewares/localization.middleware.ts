import { Request, NextFunction, Response } from 'express';

export function localization(req: Request, _: Response, next: NextFunction) {
  global.lang = req.headers['lang'];
  next();
}
