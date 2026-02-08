module.exports = function authorize(allowedRoles = []) {
  return (req, res, next) => {
    const role = req.headers["x-user-role"];
    const baseId = req.headers["x-base-id"];

    if (!role) {
      return res.status(401).json({ error: "Missing user role" });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ error: "Access denied" });
    }

    req.user = {
      role,
      base_id: baseId ? Number(baseId) : null,
    };

    next();
  };
};
