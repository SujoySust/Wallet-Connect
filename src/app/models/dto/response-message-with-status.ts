export function responseMessageWithStatus(success: boolean, message: string) {
  return {
    success: success,
    message: message,
  };
}
