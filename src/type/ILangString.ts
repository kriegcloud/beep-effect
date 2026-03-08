export interface ILangString {
    direction?: 'ltr' | 'rtl' | '' | null
    // TODO: BCP 47
    lang: string
    string: string
}
