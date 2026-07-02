import { validationResult } from 'express-validator'
import { ApiError } from '../utils/ApiError.js'

export function validate(req, _res, next) {
  const result = validationResult(req)
  if (result.isEmpty()) return next()

  const details = result.array().map((err) => ({ field: err.path, message: err.msg }))
  next(new ApiError(422, 'Validation failed', details))
}
