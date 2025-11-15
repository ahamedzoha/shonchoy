// Validation schemas
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export interface EmailValidation {
  pattern: RegExp;
  message: string;
}

export interface PasswordValidation {
  pattern: RegExp;
  message: string;
  requirements: string[];
}

export const emailValidation: EmailValidation = {
  pattern: emailRegex,
  message: "Please provide a valid email address",
};

export const passwordValidation: PasswordValidation = {
  pattern: passwordRegex,
  message:
    "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
  requirements: [
    "At least 8 characters long",
    "At least one uppercase letter",
    "At least one lowercase letter",
    "At least one number",
    "At least one special character (@$!%*?&)",
  ],
};
