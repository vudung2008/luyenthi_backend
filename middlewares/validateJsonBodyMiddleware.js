import logger from "../libs/logger.js";

export default async (req, res, next) => {
    try {
          // Chỉ kiểm tra với các request có method là POST, PUT, PATCH
        if (["POST", "PUT", "PATCH"].includes(req.method)) {
            const contentType = req.headers["content-type"];

            // Nếu không có Content-Type hoặc không phải application/json
            if (!contentType || !contentType.includes("application/json")) {
            return res.status(415).json({
                success: false,
                error: "Unsupported Media Type",
                message: "Request body must be JSON (Content-Type: application/json)",
            });
            }

            // Nếu req.body rỗng hoặc không phải object hợp lệ
            if (
            !req.body ||
            typeof req.body !== "object" ||
            Array.isArray(req.body)
            ) {
            return res.status(400).json({
                success: false,
                error: "Invalid JSON",
                message: "Body must be a valid JSON object.",
            });
            }
        }

        next(); // Nếu hợp lệ thì tiếp tục
    } catch (error) {
        logger('error', 'Loi tai validateJsonBodyMiddleware, error:', error);
        return res.status(500).json({
            message: 'Loi he thong'
        })
    }
}