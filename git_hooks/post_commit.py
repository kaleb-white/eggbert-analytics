#!/usr/bin/env python

import sys, os, platform

EGGBERT_ARCHITECTURE_REL_PATH = "\docs\eggbert_architecture.md"
EGGBERT_ARCHITECTURE_ABSOLUTE_PATH = os.getcwd() + EGGBERT_ARCHITECTURE_REL_PATH

SUBFOLDER_CHAR = chr(26)
FOLDER_SEPERATOR = "\\" if platform.system().lower().find("windows") != -1 else "/"

OUTPUT_LEFT_PADDING = "-  "
OUTPUT_FOLDER_SPACING = "\t"


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
    preprocessed: list[str] = []
    for line in (
        file_structure_text.replace("\t", SUBFOLDER_CHAR)
        .replace("    ", SUBFOLDER_CHAR)
        .splitlines()
    ):
        preprocessed += [line.replace("-   ", "").replace("-  ", "").replace("- ", "")]

    def get_num_subfolders(line: str):
        count = 0
        for char in line:
            if char == SUBFOLDER_CHAR:
                count += 1
            else:
                break
        return count

    def prepend_parent_folder(stack: list[str], folder_name: str) -> str:
        res = ""
        for folder in stack:
            res += "folder"
            res += FOLDER_SEPERATOR
        res += folder_name
        return res

    stack = []
    res = {}
    for line in preprocessed:
        # Get folder depth and remove folder chars
        count = get_num_subfolders(line)
        line = line.lstrip(SUBFOLDER_CHAR)

        # Separate at description
        [folder, description] = line.split(":")

        # Remove top from stack
        stack = stack[0:count]

        # Append stack to folder name
        full_folder_name = prepend_parent_folder(stack, folder)

        # Add to dictionary
        res[full_folder_name] = description

        # Add folder to stack
        stack.append(folder)

    return res


def main():
    if not os.getcwd().endswith("eggbert-analytics"):
        print(
            "Please only commit from the eggbert-analytics directory. The hooks are not configured to work from anywhere else."
        )

    curr_file_structure_text = get_curr_file_structure_text()
    print(file_structure_text_to_dict(curr_file_structure_text))


if __name__ == "__main__":
    main()
