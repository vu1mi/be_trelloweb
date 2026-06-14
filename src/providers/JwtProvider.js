import JWT from "jsonwebtoken";

const generateToken = async (userInfo, secretKey, tokenLifetime) => {
    try{
    return JWT.sign(userInfo, secretKey, { algorithm: 'HS256', expiresIn: tokenLifetime });
    }catch (error) {
        console.error("JWT generation error:", error);
        throw new Error("Failed to generate token");
    }
}

const verifyToken = async (token, secretKey) => {
    try {
        return JWT.verify(token, secretKey);
    } catch (error) {
        console.error("JWT verification error:", error);
        throw new Error("Invalid token");
    }
}

export const jwtProvider = {
    generateToken,
    verifyToken
}