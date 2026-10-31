// Lower-case and without accents, so "lucia" finds "Lucía".
export const normalizeForSearch = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
