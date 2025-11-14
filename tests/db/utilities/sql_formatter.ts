import { magentaString, redString } from "@/utilities/logging";

const INDENT_ON = /(LEFT JOIN)|(SELECT)|(jsonb_build_object)/g;
const DEINDENT_ON = /(FROM)|(WHERE)|(AS)|(^(\s*?)\) )/g;
const CAPITALIZED_WORDS = /([A-Z]* )/g;

export function formatSql(sql: string) {
    if (!sql) return;
    const lines = sql.split("\n");
    let currentIndentationLevel = 0;
    let nextIndentationLevel = 0;
    let currentLineCharTotal = 0;
    let nextLineCharTotal = 0;
    let output = "";
    for (let line of lines) {
        // Increment total number of chars
        currentLineCharTotal = nextLineCharTotal;
        nextLineCharTotal += line.length;

        // Change indentation level
        currentIndentationLevel = nextIndentationLevel;
        currentIndentationLevel -= [...line.matchAll(DEINDENT_ON)].length;
        currentIndentationLevel = Math.max(0, currentIndentationLevel);
        nextIndentationLevel = currentIndentationLevel;
        nextIndentationLevel += [...line.matchAll(INDENT_ON)].length;

        // Remove starting whitespace
        line = line.trimStart();

        // Replace capitalized words with colored versions
        line = line.replace(CAPITALIZED_WORDS, (capitalizedWord) =>
            magentaString(capitalizedWord)
        );

        // Skip empty lines
        if (line.length <= 1) continue;

        // Build string
        output = output.concat(
            redString(String(currentLineCharTotal))
                .concat(" ".repeat(5 - String(currentLineCharTotal).length))
                .concat("    ".repeat(currentIndentationLevel))
                .concat(line)
                .concat("\n")
        );
    }
    return output;
}
