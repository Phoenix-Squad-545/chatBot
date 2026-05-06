export type AuthStep =
  | "email"
  | "password"
  | "magic"
  | "forgot"
  | "verify"
  | "reset"
  | "register";