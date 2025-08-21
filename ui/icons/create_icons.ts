import { readFileSync, writeFileSync } from "fs"
import { svgFileLocations, tsxOutputFilePath } from "./create_icons_config.ts"

function getRawSvgXML(path: string): string | Error {
    let res: Error | string = new Error(`Loading svg at ${path} failed`)
    try {
        res = readFileSync(path).toString()
    } catch {
        return res
    }
    return res
}

function extractSvgFromXML(rawXML: string): string | Error {
    const attemptedExtraction = rawXML.match(/<svg[\s\S]*?<\/svg>/)
    if (!attemptedExtraction || attemptedExtraction[0] === undefined) return new Error(`No svg found in xml ${rawXML}`)
    if (attemptedExtraction.length > 1) return new Error(`Multiple svg tags found in xml ${rawXML}`)
    return attemptedExtraction.at(0) as string
}

function uppercaseFirstLetter(word: string) {
    return word.replace(/^[\s\S]{1}/, word[0].toUpperCase())
}

function createReactComponentAsString(iconName: string): string | Error {
    if (!Object.keys(svgFileLocations).includes(iconName)) return new Error(`Icon ${iconName} not found among svgs`)

    const raw = getRawSvgXML(svgFileLocations[iconName])
    if (raw instanceof Error) return raw

    const svgAsString = extractSvgFromXML(raw)
    if (svgAsString instanceof Error) return svgAsString

    return (
        `export function ${uppercaseFirstLetter(iconName)}() {\n\treturn (${svgAsString})\n}`
    )
}

function createIconsAsString(icons: {[key: string]: string}): string | Error {
    let errorsWhileProcessing = ""
    let components = ""

    Object.keys(icons).forEach((iconName) => {
        const attemptedCreation = createReactComponentAsString(iconName)
        if (attemptedCreation instanceof Error) {
            errorsWhileProcessing = errorsWhileProcessing.concat(`${attemptedCreation.message}\n\n`)
            return
        }
        components = components.concat(`${attemptedCreation}\n\n`)
    })

    if (errorsWhileProcessing !== "") console.log(errorsWhileProcessing)
    if (components === "") return new Error("No icons were succesfully processed")

    return components
}

function main() {
    const createIconsAttempt = createIconsAsString(svgFileLocations)
    if (createIconsAttempt instanceof Error) {
        console.error(createIconsAttempt.message)
        return
    }

    writeFileSync(tsxOutputFilePath, createIconsAttempt)
}

main()
