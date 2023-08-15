export const toCamelCase = (line: string): string => {
    const lineArr = line.split('_')
    let isItFirstWord = true
    return lineArr
        .map((word) => {
            if (isItFirstWord) {
                isItFirstWord = false
                return word
            } else {
                return capitalize(word)
            }
        })
        .join("")
}

function capitalize(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1)
}
