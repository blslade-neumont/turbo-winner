import { Request, Response, NextFunction } from 'express';

export function allowAllOrigins(req: Request, res: Response, next: NextFunction) {
    res.header("Access-Control-Allow-Origin", "*");
    if (req.header("Access-Control-Request-Headers")) res.header("Access-Control-Allow-Headers", req.header("Access-Control-Request-Headers"));
    next();
}
