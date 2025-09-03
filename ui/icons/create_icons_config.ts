import { dirname, join } from "path"
import { fileURLToPath } from "url"

const currentFileDir = dirname(fileURLToPath(import.meta.url))
export const relativeIconDirPath = join(currentFileDir, `../../public/svg_icons/`)

const createStringRouteToSVG = (svgName: string): string => `${relativeIconDirPath}${svgName}.svg`

export const svgFileLocations: {[key: string]: string} = {
    attach: createStringRouteToSVG('attach'),
    back: createStringRouteToSVG('back'),
    chart: createStringRouteToSVG('chart'),
    check: createStringRouteToSVG('check'),
    danger: createStringRouteToSVG('danger'),
    delete: createStringRouteToSVG('delete'),
    down: createStringRouteToSVG('down'),
    error: createStringRouteToSVG('error'),
    file: createStringRouteToSVG('file'),
    filter: createStringRouteToSVG('filter'),
    forward: createStringRouteToSVG('forward'),
    globe: createStringRouteToSVG('globe'),
    locked: createStringRouteToSVG('locked'),
    maximize: createStringRouteToSVG('maximize'),
    minimize: createStringRouteToSVG('minimize'),
    pin: createStringRouteToSVG('pin'),
    redo: createStringRouteToSVG('redo'),
    undo: createStringRouteToSVG('undo'),
    up: createStringRouteToSVG('up'),
    upload: createStringRouteToSVG('upload'),
    window: createStringRouteToSVG('window'),
    logo: createStringRouteToSVG('logo'),
    new: createStringRouteToSVG('new'),
    switch: createStringRouteToSVG('switch'),
    feed: createStringRouteToSVG('feed'),
}

export const propertyConversions: {[key: string]: string} = {
    'xmlns:xlink': 'xmlnsXlink',
    'xlink:href' : 'xlinkHref'
}

const tsxOutputFile = './icons.tsx'
export const tsxOutputFilePath = join(currentFileDir, tsxOutputFile)
