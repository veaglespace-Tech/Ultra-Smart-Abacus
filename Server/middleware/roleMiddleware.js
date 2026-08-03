const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const userRole = String(req.user.role || "").toUpperCase();
    const allowedRoles = roles.map(r => String(r).toUpperCase());

    // ADMIN always bypasses role checks
    if (userRole === "ADMIN") {
      return next();
    }

    if (!allowedRoles.includes(userRole)) {
      console.warn(`[Role Auth Denied] User: "${req.user.name || req.user.email}" (${userRole}) attempted ${req.method} ${req.originalUrl}. Allowed: [${allowedRoles.join(", ")}]`);
      return res.status(403).json({
        message: `Access denied. Role "${userRole}" not authorized.`,
      });
    }

    next();
  };
};

export default authorize;