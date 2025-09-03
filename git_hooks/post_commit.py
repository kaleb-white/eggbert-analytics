#!/usr/bin/env python

import os, platform, re

EGGBERT_ARCHITECTURE_REL_PATH = "\docs\eggbert_architecture.md"
EGGBERT_ARCHITECTURE_ABSOLUTE_PATH = os.getcwd() + EGGBERT_ARCHITECTURE_REL_PATH

SUBFOLDER_CHAR = chr(26)  # Ascii 'substitute' character
FOLDER_SEPERATOR = (
    chr(92) if platform.system().lower().find("windows") != -1 else "/"
)  # chr(92) = \
DESCRIPTION_SEPERATOR = ":"

EXCLUDED_DIRECTORIES = [".next", ".git", "node_modules"]
ABSOLUTE_DIRECTORY = re.compile(".*eggbert-analytics.{1}")

OUTPUT_DIRS_TO_NOT_LIST = ["interfaces"]
OUTPUT_LEFT_PADDING = "-   "
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


def save_file_structure_text(new: str):
    previous = ""
    with open(EGGBERT_ARCHITECTURE_ABSOLUTE_PATH, mode="r") as f:
        previous = f.read()

    file_with_new_file_structure = previous.replace(get_curr_file_structure_text(), new)

    with open(file=EGGBERT_ARCHITECTURE_ABSOLUTE_PATH, mode="w") as f:
        f.write(file_with_new_file_structure)


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
            res = res + folder + FOLDER_SEPERATOR
        res += folder_name
        return res

    stack = []
    res = {}
    for line in preprocessed:
        # Get folder depth and remove folder chars
        count = get_num_subfolders(line)
        line = line.lstrip(SUBFOLDER_CHAR)

        # Separate at description
        [folder, description] = line.split(DESCRIPTION_SEPERATOR)

        # Remove top from stack
        stack = stack[0:count]

        # Append stack to folder name
        full_folder_name = prepend_parent_folder(stack, folder)

        # Add to dictionary
        res[full_folder_name] = description

        # Add folder to stack
        stack.append(folder)

    return res


def file_structure_to_list():
    res = []
    for root, dirs, _ in os.walk(os.getcwd()):
        # Avoid parsing some dirs (such as node_modules or .git)
        dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRECTORIES]

        # Replace absolute directory with relative
        relative_root = root
        absolute_root_match = re.match(ABSOLUTE_DIRECTORY, root)
        if absolute_root_match is not None:
            relative_root = relative_root.replace(absolute_root_match.group(), "")

        if "eggbert-analytics" in relative_root:
            continue

        res += [relative_root]
    return res


def dict_to_output(existing: dict[str, str], at_parse: list[str]) -> str:
    res = ""
    for dir in at_parse:
        depth = dir.count(FOLDER_SEPERATOR)
        folder_name = dir.split(FOLDER_SEPERATOR)[-1]
        if folder_name in OUTPUT_DIRS_TO_NOT_LIST:
            continue

        description = (
            existing[dir]
            if existing.get(dir) is not None
            else " folder has no description"
        )

        res += (
            OUTPUT_FOLDER_SPACING * depth
            + OUTPUT_LEFT_PADDING
            + folder_name
            + DESCRIPTION_SEPERATOR
            + description
            + "\n"
        )
    return res.rstrip("\n")


def main():
    if not os.getcwd().endswith("eggbert-analytics"):
        print(
            "Please only commit from the eggbert-analytics directory. The hooks are not configured to work from anywhere else."
        )

    curr_file_structure_text = get_curr_file_structure_text()
    curr_file_structure_text_as_dict = file_structure_text_to_dict(
        curr_file_structure_text
    )

    dirs = file_structure_to_list()

    new_file_structure_desc = dict_to_output(curr_file_structure_text_as_dict, dirs)

    save_file_structure_text(new_file_structure_desc)


if __name__ == "__main__":
    main()
