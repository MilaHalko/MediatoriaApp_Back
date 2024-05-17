import {ALLOWED_IMAGE_FORMATS, ALLOWED_IMAGE_MIME_TYPES, ALLOWED_IMAGE_SIZE_MB} from "../config/constants.js";

export const isImage = (file) => {
    const imageName = file.split('/').pop()
    const imageFormat = imageName.split('.').pop()

    if (!ALLOWED_IMAGE_FORMATS.includes(imageFormat) || !ALLOWED_IMAGE_MIME_TYPES.includes(imageName.mimetype)) {
        throw new Error('Only jpg, jpeg, png, and gif formats are allowed')
    }
    if (file.size > ALLOWED_IMAGE_SIZE_MB * 1024 * 1024) {
        throw new Error(`File size must be less than ${ALLOWED_IMAGE_SIZE_MB}MB`)
    }
    return true
}