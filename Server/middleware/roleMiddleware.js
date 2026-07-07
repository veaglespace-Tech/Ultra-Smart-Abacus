const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (!roles.includes(req.user.role)) {
      console.warn(`Access Denied: User role "${req.user.role}" is not in authorized list [${roles.join(", ")}] for route ${req.originalUrl}`);
      return res.status(403).json({
        message: `Access denied. Role "${req.user.role}" not authorized.`,
      });
    }

    next();
  };
};

export default authorize;