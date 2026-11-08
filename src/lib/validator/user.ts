export function isValidNickname(nickname: string): boolean {
    const nicknameRegex = /^[A-Za-z0-9]+$/;
    return nickname.length <= 20 && nicknameRegex.test(nickname);
};

export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 64;
// bcrypt враховує лише перші 72 байти пароля, решту мовчки відкидає.
const BCRYPT_MAX_BYTES = 72;

export const PASSWORD_RULE = `Пароль: ${PASSWORD_MIN}–${PASSWORD_MAX} символів без пробілів, можна спецсимволи`;

// Тексти помилок API (англійською, як і решта повідомлень API).
export const NICKNAME_ERROR = "Nickname must include: A-Z,a-z,0-9 and must be up to 20 symbols";
export const PASSWORD_ERROR = `Password must be ${PASSWORD_MIN}-${PASSWORD_MAX} characters without spaces (special characters allowed)`;

/** Будь-які символи без пробілів (зокрема ! @ # та кирилиця), 8–64 символи і не більше 72 байтів. */
export function isValidPassword(password: string): boolean {
    if (typeof password !== "string") return false;
    if (!/^\S+$/.test(password)) return false;
    if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) return false;
    return new TextEncoder().encode(password).length <= BCRYPT_MAX_BYTES;
}
