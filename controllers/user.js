const {
  generateAccessToken,
  generateRefreshToken,
} = require("../middlewares/jwt");
const user = require("../models/user");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const register = asyncHandler(async (req, res) => {
  const { email, password, name ,mobile} = req.body;

  if (!email || !password || !name || !mobile)
    return res.status(400).json({
      sucess: false,
      mes: "Missing input",
    });
  // tìm mobile đã đăng ký hay chưa
  const user = await User.findOne({ mobile: mobile });
  if (user) {
    throw new Error("User has existed"); // lỗi user đã tồn tại
  } else {
    const newUser = await User.create(req.body); // tạo newUser
    return res.status(200).json({
      sucess: newUser ? true : false,
      mes: newUser
        ? "Register is successfully. Please go login"
        : "Something went wrong",
    });
  }
});

// refresh token => cấp mới access token
// access token => xác thục người dùng và cấp quyền cho người dùng
const login = asyncHandler(async (req, res) => {
  const { mobile, password } = req.body;

  if (!mobile || !password)
    return res.status(400).json({
      sucess: false,
      mes: "Missing input",
    });
  const response = await User.findOne({ mobile });
  if (response && (await response.isCorrectPassword(password))) {
    // Tách password và role ra khỏi response
    const { password, role, ...userData } = response.toObject();

    // Tạo refreshToken  token
    const accessToken = generateAccessToken(response._id, role);
    const refreshToken = generateRefreshToken(response._id);
    // Lưu refreshToken vào database
    await User.findByIdAndUpdate(response._id, { refreshToken }, { new: true });
    // Lưu refreshToken vào cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({
      sucess: true,
      accessToken,
      userData,
    });
  } else {
    throw new Error("Invalid credentials !");
  }
});

const getCurrent = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const user = await User.findById(_id).select("-refreshToken -password -role");
  return res.status(200).json({
    sucess: false,
    res: user ? user : "User not found",
  });
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  // check xem co token hay khong
  if (!cookie && !cookie.refreshToken)
    throw new Error("No refresh token in cookie ");
  // check xen token co hop le hay ko
  const rs = await jwt.verify(cookie.refreshToken, process.env.JWT_SECRET);
  const response = await User.findOne({
    _id: rs._id,
    refreshToken: cookie.refreshToken,
  });
  return res.status(200).json({
    sucess: response ? true : false,
    newAccessToken: response
      ? generateAccessToken(response._id, response.role)
      : "refresh token not matched",
  });
});
const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie || !cookie.refreshToken)
    throw new Error("No refresh  token in cookies");
  // xóa refresh token ở db
  await User.findOneAndUpdate(
    { refreshToken: cookie.refreshToken },
    { refreshToken: "" },
    { new: true }
  );
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  return res.status(200).json({
    sucess: true,
    mes: "logout is done",
  });
});

// client gửi email
// server check email có hợp lệ hay ko ==> gửi mail + kem theo link(password change token)
// client check mail => click email
// client gửi api kem token
// check token có giống với token mà server gửi mail hay ko
// change password

// const forgetPassword = asyncHandler(async (req, res) => {
//   const { email } = req.query;
//   if (!email) throw new Error("Missing email");
//   const user = await User.findOne({ email });
//   if (!user) throw new Error("User not found");
//   const resetToken = user.createPasswordChangedToken();
//   await user.save();

//   const html = `Xin vui lòng click vào link dưới đây để thay đổi mật khẩu của bạn. link này sẽ hết hạn sau 15 phút kể từ bây giờ <a href=${process.env.URL_SERVER}/api/>user/reset-password/${resetToken}>Click here </a>`;

//   const data = {
//       to: email,
//       html
//   }
//   const rs  = await sendMail(data)
//   return res.status(200).json({
//     sucess: true,
//     rs
//   })
// });

// const getAllUser = asyncHandler(async (req, res) => {
//   const response = await User.find();
//   return res.status(200).json({
//     sucess: response ? true : false,
//     users: response
//   })
// });

module.exports = {
  register,
  login,
  getCurrent,
  refreshAccessToken,
  logout,
  // forgetPassword,
};
