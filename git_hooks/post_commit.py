#!/usr/bin/env python

import sys, os

EGGBERT_ARCHITECTURE_REL_PATH = "\docs\eggbert_architecture.md"
EGGBERT_ARCHITECTURE_ABSOLUTE_PATH = os.getcwd() + EGGBERT_ARCHITECTURE_REL_PATH

SUBFOLDER_CHAR = chr(26)


def get_curr_file_structure_text():
    with open(EGGBERT_ARCHITECTURE_ABSOLUTE_PATH, "r") as f:
        return (
            f.read()
            .split(
                "### Project File Structure (DO NOT CHANGE THIS HEADER, GIT HOOK DEPENDS ON IT)"
            )[1]
            .split("###")[0]
            .strip("\n")
            .rstrip("\n")
        )


def file_structure_text_to_dict(file_structure_text: str):
    preprocessed = ""
    for line in (
        file_structure_text.replace("\t", SUBFOLDER_CHAR)
        .replace("    ", SUBFOLDER_CHAR)
        .splitlines()
    ):
        preprocessed += line.replace("-   ", "").replace("-  ", "").replace("- ", "")

    return preprocessed
    for line in preprocessed.splitlines():
        ...


def main():
    if not os.getcwd().endswith("eggbert-analytics"):
        print(
            "Please only commit from the eggbert-analytics directory. The hooks are not configured to work from anywhere else."
        )

    curr_file_structure_text = get_curr_file_structure_text()
    print(file_structure_text_to_dict(curr_file_structure_text))


if __name__ == "__main__":

    main()
