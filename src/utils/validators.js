const OBJECT_ID_RULE = /^[0-9a-fA-F]{24}$/
const OBJECT_ID_RULE_MESSAGE = 'Your string fails to match the Object Id pattern!'
const ROLE_MESSAGES = "This is not empty"
const ROLE_REGEX_EMAIL = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const ROLE_ERRORS_EMAIL = "Invalid email format";
const ROLE_REGEX_PASSWORD = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
const ROLE_ERRORS_PASSWORD = "Password must contain at least one letter and one number and be at least 8 characters long";
const ROLE_REGEX_FULLNAME = /^[a-zA-Z\s]+$/;
const ROLE_ERRORS_FULLNAME = "Full name must contain only letters and spaces";
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp"
];
export {
    OBJECT_ID_RULE,
    OBJECT_ID_RULE_MESSAGE,
    ROLE_MESSAGES,
    ROLE_REGEX_EMAIL,
    ROLE_ERRORS_EMAIL,
    ROLE_REGEX_PASSWORD,
    ROLE_ERRORS_PASSWORD,
    ROLE_REGEX_FULLNAME,
    ROLE_ERRORS_FULLNAME,
    ALLOWED_TYPES,
    MAX_SIZE

}