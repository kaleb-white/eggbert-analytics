import { describe, expect, test } from "bun:test";
import { extractSvgFromXML, getRawSvgXML } from "../create_icons";
import { relativeIconDirPath, svgFileLocations, tsxOutputFilePath } from "../create_icons_config";

describe("test func getRawSvgXML", () => {
    test("errors on bad path", () => {
        expect(getRawSvgXML("a")).toBeInstanceOf(Error)
    })

    test("successful get includes text xml and svg", () => {
        expect(getRawSvgXML(svgFileLocations["attach"])).toInclude("xml")
        expect(getRawSvgXML(svgFileLocations["attach"])).toInclude("svg")
    })
})

describe("test func extractSvgFromXML", () => {
    test("errors on multiple svgs in string", () => {
        const singleSvg = getRawSvgXML(svgFileLocations["attach"])
        const doubleSvg = (singleSvg as string).concat(singleSvg as string)
        expect(extractSvgFromXML(doubleSvg)).toBeInstanceOf(Error)
    })

    test("errors on empty string string", () => {
        expect(extractSvgFromXML("")).toBeInstanceOf(Error)
    })

    test("result does not contain xml", () => {
        const svg = getRawSvgXML(svgFileLocations["attach"])
        expect(extractSvgFromXML(svg as string)).not.toInclude("<xml")
    })
})
