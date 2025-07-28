// Middleware para validar el body
export function validateBody(schema) {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                ok: false,
                mensaje: error.details[0].message,
                error: error.details[0].message
            });
        }
        next();
    };
}

// Middleware que valida que hayan links
export function validateAllreclamos(schema) {
    return (req, res, next) => {
        const { error } = schema.validate(req.query);
        if (error) {
            return res.status(400).json({
                ok: false,
                mensaje: error.details[0].message,
                error: error.details[0].message
            });
        }
        next();
    };
}