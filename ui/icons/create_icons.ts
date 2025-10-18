import { readFileSync, writeFileSync } from "fs";
import {
    svgFileLocations,
    tsxOutputFilePath,
    propertyConversions,
    sizeParamName,
    removeDefaultWidthHeight,
    removeDefaultFill,
    additionalNamingForAllSvgs,
    fillParamName,
    fillFallbackOnNoDefault,
} from "./create_icons_config.ts";
import { fileURLToPath } from "url";

export function getRawSvgXML(path: string): string | Error {
    let res: Error | string = new Error(`Loading svg at ${path} failed`);
    try {
        res = readFileSync(path).toString();
    } catch {
        return res;
    }
    return res;
}

export function extractSvgFromXML(rawXML: string): string | Error {
    const attemptedExtraction = rawXML.match(/<svg[\s\S]*?<\/svg>/g);
    if (!attemptedExtraction || attemptedExtraction[0] === undefined)
        return new Error(`No svg found in xml ${rawXML}`);
    if (attemptedExtraction.length > 1)
        return new Error(`Multiple svg tags found in xml ${rawXML}`);
    return attemptedExtraction.at(0) as string;
}

export function removeSizing(svg: string): string {
    return svg
        .replace(/width="(.*?)" /g, "")
        .replace(/height="(.*?)" /g, "")
        .replace(
            /<svg /,
            `<svg width={${sizeParamName}} height={${sizeParamName}} `
        );
}

export function removeFill(svg: string): string {
    return svg.replace(/fill="(.*?)"/g, "fill={fillHex}");
}

export function convertXMLPropertiesToSvg(svg: string): string {
    Object.keys(propertyConversions).forEach((xmlProperty) => {
        if (svg.includes(xmlProperty))
            console.log(`\tFound and replaced property ${xmlProperty}...`);
        svg = svg.replace(
            new RegExp(xmlProperty, "g"),
            propertyConversions[xmlProperty]
        );
    });
    return svg;
}

export function uppercaseFirstLetter(word: string) {
    return word.replace(/^[\s\S]{1}/, word[0].toUpperCase());
}

function isNotLogo(iconName: string) {
    return iconName.toUpperCase() != "Logo".toUpperCase();
}

export function createReactComponentAsString(iconName: string): string | Error {
    if (!Object.keys(svgFileLocations).includes(iconName))
        return new Error(`Icon ${iconName} not found among svgs`);

    const raw = getRawSvgXML(svgFileLocations[iconName]);
    if (raw instanceof Error) return raw;

    const svgAsString = extractSvgFromXML(raw);
    if (svgAsString instanceof Error) return svgAsString;

    const svgWithFixedProperties = convertXMLPropertiesToSvg(svgAsString);

    let svgSizingRemoved = svgWithFixedProperties;
    if (removeDefaultWidthHeight && isNotLogo(iconName)) {
        svgSizingRemoved = removeSizing(svgSizingRemoved);
    }

    let svgFillRemoved = svgSizingRemoved;
    if (removeDefaultFill && isNotLogo(iconName)) {
        svgFillRemoved = removeFill(svgFillRemoved);
    }

    const svgFinal = svgFillRemoved;

    return `export function ${uppercaseFirstLetter(
        iconName
    )}${additionalNamingForAllSvgs}(${
        isNotLogo(iconName)
            ? `${removeDefaultWidthHeight ? `${sizeParamName}: number` : ""}
            ,
            ${
                removeDefaultFill
                    ? `${fillParamName}: string = ${fillFallbackOnNoDefault}`
                    : ""
            }`
            : ""
    }) {\n\treturn (${svgFinal})\n}`;
}

export function createIconsAsString(icons: {
    [key: string]: string;
}): string | Error {
    let errorsWhileProcessing = "";
    let components = "";

    Object.keys(icons).forEach((iconName) => {
        console.log(`Converting icon ${iconName} to string...`);
        const attemptedCreation = createReactComponentAsString(iconName);
        if (attemptedCreation instanceof Error) {
            errorsWhileProcessing = errorsWhileProcessing.concat(
                `${attemptedCreation.message}\n\n`
            );
            return;
        }
        components = components.concat(`${attemptedCreation}\n\n`);
    });

    if (errorsWhileProcessing !== "") console.log(errorsWhileProcessing);
    if (components === "")
        return new Error("No icons were succesfully processed");

    return components;
}

function main() {
    console.log("Beginning create icons...");
    const createIconsAttempt = createIconsAsString(svgFileLocations);
    if (createIconsAttempt instanceof Error) {
        console.error(createIconsAttempt.message);
        return;
    }

    console.log(`Saving output to ${tsxOutputFilePath}...`);
    writeFileSync(tsxOutputFilePath, createIconsAttempt);
    console.log("Success!");
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
    main();
}
