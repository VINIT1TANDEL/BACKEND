const sendToken = (user, statusCode, res) => {
    const token = user.getJWTToken();

    // Options for cookie
    const options = {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: true,            // Ensures cookie is sent only over HTTPS
        sameSite: "None"         // Required for cross-site requests (e.g., Vercel <-> Render)
    };

    res.status(statusCode).cookie("token", token, options).json({
        success: true,
        user,
        token,
    });
};

module.exports = sendToken;
