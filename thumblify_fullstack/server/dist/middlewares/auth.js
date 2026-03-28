import jwt from "jsonwebtoken";
const protect = (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth) {
        return res.status(401).json({ message: "Not authorized" });
    }
    const token = auth.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    }
    catch {
        return res.status(401).json({ message: "Invalid token" });
    }
};
export default protect;
