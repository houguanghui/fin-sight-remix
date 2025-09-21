export const safeJSONParse = (str: string, defaultValue = undefined) => { try { return JSON.parse(str) } catch { return defaultValue } }

 