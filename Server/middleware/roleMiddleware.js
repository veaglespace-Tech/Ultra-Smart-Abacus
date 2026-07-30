const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    // ADMIN always bypasses role checks
    if (req.user.role === "ADMIN") {
      return next();
    }

    if (!roles.includes(req.user.role)) {
      console.warn(`[Role Auth Denied] User: "${req.user.name || req.user.email}" (${req.user.role}) attempted ${req.method} ${req.originalUrl}. Allowed: [${roles.join(", ")}]`);
      return res.status(403).json({
        message: `Access denied. Role "${req.user.role}" not authorized.`,
      });
    }

    next();
  };
};

export default authorize;