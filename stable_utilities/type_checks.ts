export function isCryptoUtilityCreator(obj: unknown): boolean {
    return typeof(obj) === 'object'
        && Object.keys(obj as object).includes('createUniqueId')
}
