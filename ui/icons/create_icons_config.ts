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
    anonymous: createStringRouteToSVG("anonymous"),
    attach: createStringRouteToSVG("attach"),
    author: createStringRouteToSVG("author"),
    back: createStringRouteToSVG("back"),
    chart: createStringRouteToSVG("chart"),
    check: createStringRouteToSVG("check"),
    danger: createStringRouteToSVG("danger"),
    delete: createStringRouteToSVG("delete"),
    down: createStringRouteToSVG("down"),
    enter: createStringRouteToSVG("enter"),
    error: createStringRouteToSVG("error"),
    exit: createStringRouteToSVG("exit"),
    feed: createStringRouteToSVG("feed"),
    file: createStringRouteToSVG("file"),
    filter: createStringRouteToSVG("filter"),
    forward: createStringRouteToSVG("forward"),
    globe: createStringRouteToSVG("globe"),
    info: createStringRouteToSVG("info"),
    left: createStringRouteToSVG("left"),
    locked: createStringRouteToSVG("locked"),
    maximize: createStringRouteToSVG("maximize"),
    minimize: createStringRouteToSVG("minimize"),
    noUser: createStringRouteToSVG("no_user"),
    pin: createStringRouteToSVG("pin"),
    question: createStringRouteToSVG("question"),
    redo: createStringRouteToSVG("redo"),
    respondent: createStringRouteToSVG("respondent"),
    right: createStringRouteToSVG("right"),
    undo: createStringRouteToSVG("undo"),
    up: createStringRouteToSVG("up"),
    upload: createStringRouteToSVG("upload"),
    window: createStringRouteToSVG("window"),
    new: createStringRouteToSVG("new"),
    switch: createStringRouteToSVG("switch"),
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

const rawTsxOutputFile = "./raw_icons.tsx";
export const rawTsxOutputFilePath = join(currentFileDir, rawTsxOutputFile);

const usableTsxOutputFile = "./icons.tsx";
export const usableTsxOutputFilePath = join(
    currentFileDir,
    usableTsxOutputFile
);

export const rawPathRelativeToUsable = "./raw_icons.tsx";
