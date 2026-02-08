const authorize = (allowedRoles) => {
  return (req, res, next) => {
    // In production, decode this from a JWT token
    const userRole = req.headers["x-user-role"];

    if (!allowedRoles.includes(userRole)) {
      return res
        .status(403)
        .json({ message: "Access Denied: Insufficient Clearance" });
    }
    next();
  };
};

module.exports = authorize;
