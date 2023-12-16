export const PASSWORD_REGEX = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Z])(?=.*[a-z]).{8,24}$/;
export const WEAK_PASSWORD_MESSAGE =
  "password should have from 8 to 24 charachters, have at least 1 number, 1 special character, 1 capital letter, 1 small letter ";
export const ACCOUTN_CONFIRMATION = "Account confirmation ✔";
export const RESET_PASSWORD_VERIFICATION_CODE = "Reset password verification code ✔";
export const USER_NOT_FOUND = "User not found";
export const PROFILE_NOT_FOUND = "Profile not found";
export const MEASUREMENTS_NOT_FOUND = "Measurement not found";
export const VVERIFICTION_CODE_RESPONSE = {
  status: "ok",
  message: "verification code has been send",
};
export const RESEND_CONFIRMATION_RESPONSE = {
  status: "ok",
  message: "confirmation email has been resend",
};
export const MEASUREMENTS_DELETED_RESPONSE = {
  status: "ok",
  message: "all measurements deleted",
};
export const USER_VERIFIED_RESPONSE = {
  status: "ok",
  message: "user successfully verified",
};
export const PASSWORD_RESET_RESPONSE = {
  status: "ok",
  message: "password has been reset",
};

export function VERIFICATION_EMAIL_MESSAGE(email: string, url: string): string {
  return `Hello ${email} \n\n Please verify your account by clicking the link: ${url} \n\n Thank You!\n`;
}

export function RESET_PASSWORD_MESSAGE(email: string, code: number): string {
  return `Hello ${email} \n\n Please reset your password with code: ${code} \n\n Thank You!\n`;
}
