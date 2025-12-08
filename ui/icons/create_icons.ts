import { readFileSync, writeFileSync } from "fs";
import {
    svgFileLocations,
    rawTsxOutputFilePath,
    propertyConversions,
    sizeParamName,
    removeDefaultWidthHeight,
    removeDefaultFill,
    additionalNamingForAllSvgs,
    fillParamName,
    fillFallbackOnNoDefault,
    rawPathRelativeToUsable,
    usableTsxOutputFilePath,
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

export function createRawReactComponentAsString(
    iconName: string
): string | Error {
    if (!Object.keys(svgFileLocations).includes(iconName))
        return new Error(`Icon ${iconName} not found among svgs`);

    const raw = getRawSvgXML(svgFileLocations[iconName]);
    if (raw instanceof Error) return raw;

    const svgAsString = extractSvgFromXML(raw);
    if (svgAsString instanceof Error) return svgAsString;

    const svgWithFixedProperties = convertXMLPropertiesToSvg(svgAsString);

    let svgSizingRemoved = svgWithFixedProperties;
    if (removeDefaultWidthHeight) {
        svgSizingRemoved = removeSizing(svgSizingRemoved);
    }

    let svgFillRemoved = svgSizingRemoved;
    if (removeDefaultFill) {
        svgFillRemoved = removeFill(svgFillRemoved);
    }

    const svgFinal = svgFillRemoved;

    return `export function ${uppercaseFirstLetter(
        iconName
    )}${additionalNamingForAllSvgs}(${`${
        removeDefaultWidthHeight ? `${sizeParamName}: number` : ""
    },
        ${
            removeDefaultFill
                ? `${fillParamName}: string = ${fillFallbackOnNoDefault}`
                : ""
        }`}) {\n\treturn (${svgFinal})\n}`;
}

export function createRawIconsAsString(icons: {
    [key: string]: string;
}): string | Error {
    let errorsWhileProcessing = "";
    let components = "";

    Object.keys(icons).forEach((iconName) => {
        console.log(`Converting icon ${iconName} to string...`);
        const attemptedCreation = createRawReactComponentAsString(iconName);
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

function createUsableReactComponentAsString(iconName: string): string {
    return `export function ${uppercaseFirstLetter(
        iconName
    )}(props: FaviconProps) {
        return <WrapIcon icon={${uppercaseFirstLetter(
            iconName
        )}${additionalNamingForAllSvgs}} {...props} />
    }`;
}

function createUseableIconsAsString(icons: { [key: string]: string }): string {
    let components = "\n";
    Object.keys(icons).forEach((iconName) => {
        console.log(`Creating usable icon for ${iconName}...`);
        components = components.concat(
            `${createUsableReactComponentAsString(iconName)}\n\n`
        );
    });
    return components;
}

function importRawIcons(icons: { [key: string]: string }): string {
    return `"use client"\nimport { ${Object.keys(icons)
        .map(
            (key) => `${uppercaseFirstLetter(key)}${additionalNamingForAllSvgs}`
        )
        .join(", ")} } from "${rawPathRelativeToUsable}";\n`;
}

function getMetaText(fileText: string): string {
    const startPos = fileText.search(/@@@START@@@/);
    const endPos = fileText.search(/@@@END@@@/);
    if (startPos === -1 || endPos === -1) return "";
    return fileText.slice(startPos - 2, endPos + 9); // Offset for length of meta tag and comment before //
}

function main() {
    console.log("Beginning raw icons...");
    const createRawIconsAttempt = createRawIconsAsString(svgFileLocations);
    if (createRawIconsAttempt instanceof Error) {
        console.error(createRawIconsAttempt.message);
        return;
    }

    console.log(`Saving output to ${rawTsxOutputFilePath}...`);
    writeFileSync(rawTsxOutputFilePath, createRawIconsAttempt);
    console.log("Done!");

    console.log("Beginning usable icons...");
    const usableIconsTop = importRawIcons(svgFileLocations);
    const usableIconsMeta = getMetaText(
        readFileSync(usableTsxOutputFilePath, "ascii")
    );
    const usableIcons = createUseableIconsAsString(svgFileLocations);
    const iconsTsxText = usableIconsTop
        .concat(usableIconsMeta)
        .concat(usableIcons);
    console.log(`Saving output to ${usableTsxOutputFilePath}...`);
    writeFileSync(usableTsxOutputFilePath, iconsTsxText);
    console.log("Done");
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
    main();
}
