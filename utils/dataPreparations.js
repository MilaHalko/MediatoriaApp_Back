export const fileNamePreparation = (fileName) => {
    const stamp = new Date().getTime()
    return fileName
            .split('\\').pop()
            .split(' ').join('_')
            .toLowerCase()
            .replace(/[^a-zA-Z0-9_]/g, '')
            .replace(/_{2,}/g, '_')
            + '_' + stamp
}