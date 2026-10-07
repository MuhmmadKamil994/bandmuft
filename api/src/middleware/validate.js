const { httpError } = require('./error');

// Zod schema se request validate karo — ghalat input yahin ruk jayega
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const msg = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
      return next(httpError(400, msg));
    }
    req.body = result.data;
    next();
  };
}

module.exports = { validate };
