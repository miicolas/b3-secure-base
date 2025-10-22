import { decode, sign, verify } from "hono/jwt";

export const generateToken = async (payload: { sub: string; exp: number }) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined");
    }
    const token = await sign(payload, process.env.JWT_SECRET);
    return token;
};

export const verifyToken = async (token: string) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined");
    }
    const payload = await verify(token, process.env.JWT_SECRET);
    return payload;
};

export const decodeToken = (token: string) => {
    const payload = decode(token);
    return payload;
};
