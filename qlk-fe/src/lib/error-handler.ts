/**
 * Tiện ích chuẩn hóa và hiển thị lỗi:
 * Theo yêu cầu: "Nếu chức năng nào có lỗi hiển thị thông báo lỗi cho người dùng biết nội dung báo lỗi,
 * nếu lỗi về server thì thông báo là 'Yêu cầu admin sửa chữa'"
 */

export interface FormattedError {
  isServerError: boolean;
  message: string;
  detail?: string;
}

export function parseAppError(error: any): FormattedError {
  if (!error) {
    return {
      isServerError: false,
      message: 'Đã xảy ra lỗi không xác định',
    };
  }

  const rawMessage = typeof error === 'string' ? error : error.message || String(error);
  const status = error.status || (error.response && error.response.status);

  // Nhận diện lỗi máy chủ (Server Error 5xx, Network crash, connection refused)
  const isServer =
    status >= 500 ||
    rawMessage.includes('500') ||
    rawMessage.includes('502') ||
    rawMessage.includes('503') ||
    rawMessage.includes('504') ||
    rawMessage.includes('Internal Server Error') ||
    rawMessage.includes('Failed to fetch') ||
    rawMessage.includes('NetworkError') ||
    rawMessage.includes('ECONNREFUSED') ||
    rawMessage.includes('Yêu cầu admin sửa chữa') ||
    rawMessage.includes('Yêu cấu admin sửa chữa');

  if (isServer) {
    return {
      isServerError: true,
      message: 'Yêu cầu admin sửa chữa',
      detail: rawMessage,
    };
  }

  return {
    isServerError: false,
    message: rawMessage,
    detail: error.stack,
  };
}
