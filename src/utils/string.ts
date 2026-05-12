export const toCapitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

export const toUncapitalize = (str: string) => {
    return str.charAt(0).toLowerCase() + str.slice(1)
}

export const isEmoji = (char: string) => {
    return /\p{Emoji_Presentation}/u.test(char)
}

export const isOnlySpaces = (str: string) => {
    return str.trim().length === 0
};

export const escapeSafe = (str: string) => {
    return str.replace(/[^\p{Script=Latin}\p{N}._\- :]/gu, '');
};