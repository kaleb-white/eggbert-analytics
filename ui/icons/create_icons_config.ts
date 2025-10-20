import { dirname, join } from "path";
import { fileURLToPath } from "url";

const currentFileDir = dirname(fileURLToPath(import.meta.url));
export const relativeIconDirPath = join(
    currentFileDir,
    `../../public/svg_icons/`
);

const createStringRouteToSVG = (svgName: string): string =>
    `${relativeIconDirPath}${svgName}.svg`;

export const svgFileLocations: { [key: string]: string } = {
    attach: createStringRouteToSVG("attach"),
    back: createStringRouteToSVG("back"),
    chart: createStringRouteToSVG("chart"),
    check: createStringRouteToSVG("check"),
    danger: createStringRouteToSVG("danger"),
    delete: createStringRouteToSVG("delete"),
    down: createStringRouteToSVG("down"),
    error: createStringRouteToSVG("error"),
    file: createStringRouteToSVG("file"),
    filter: createStringRouteToSVG("filter"),
    forward: createStringRouteToSVG("forward"),
    globe: createStringRouteToSVG("globe"),
    info: createStringRouteToSVG("info"),
    locked: createStringRouteToSVG("locked"),
    maximize: createStringRouteToSVG("maximize"),
    minimize: createStringRouteToSVG("minimize"),
    pin: createStringRouteToSVG("pin"),
    question: createStringRouteToSVG("question"),
    redo: createStringRouteToSVG("redo"),
    undo: createStringRouteToSVG("undo"),
    up: createStringRouteToSVG("up"),
    upload: createStringRouteToSVG("upload"),
    window: createStringRouteToSVG("window"),
    new: createStringRouteToSVG("new"),
    switch: createStringRouteToSVG("switch"),
    feed: createStringRouteToSVG("feed"),
};

export const sizeParamName = "edgeLengthPx";
export const removeDefaultWidthHeight = true;

export const fillParamName = "fillHex";
export const removeDefaultFill = true;
export const fillFallbackOnNoDefault = '"#1C274C"';

export const additionalNamingForAllSvgs = "Raw";

export const propertyConversions: { [key: string]: string } = {
    "xmlns:xlink": "xmlnsXlink",
    "xlink:href": "xlinkHref",
    "clip-path": "clipPath",
    "fill-rule": "fillRule",
    "clip-rule": "clipRule",
    "stroke-width": "strokeWidth",
    "stroke-linecap": "strokeLinecap",
    "stroke-linejoin": "strokeLinejoin",
};

const tsxOutputFile = "./raw_icons.tsx";
export const tsxOutputFilePath = join(currentFileDir, tsxOutputFile);
