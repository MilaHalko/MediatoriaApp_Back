export const fileNamePreparation = (fileName) => {
    const stamp = new Date().getTime()
    return fileName
            .split('\\').pop()
            .split(' ').join('_')
            .toLowerCase()
            .replace(/\W/g, '')
            .replace(/_{2,}/g, '_')
            + '_' + stamp
}