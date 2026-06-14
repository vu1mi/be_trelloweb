import { StatusCodes } from 'http-status-codes'
// import { env } from '~/config/environment'
import ApiError from '~/utils/ApiError.js'

export const handlerError = (err, req, res, next) => {

  if (!err.statusCode) err.statusCode = StatusCodes.INTERNAL_SERVER_ERROR
  console.error("👉 Error caught in handlerError middleware:", err)

  // Tạo ra một biến responseError để kiểm soát những gì muốn trả về
  const responseError = {
    statusCode: err.statusCode,
    message: err.message || StatusCodes[err.statusCode], // Nếu lỗi mà không có message thì lấy ReasonPhrases chuẩn theo mã Status Code
    stack: err.stack
  }
  
  // Đoạn này có thể mở rộng nhiều về sau như ghi Error Log vào file, bắn thông báo lỗi vào group Slack, Telegram, Email...vv Hoặc có thể viết riêng Code ra một file Middleware khác tùy dự án.
  // ...
  // console.error(responseError)
  // Trả responseError về phía Front-end
  res.status(responseError.statusCode).json(responseError)
}