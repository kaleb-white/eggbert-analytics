#!/usr/bin/env python

import sys, os

EGGBERT_ARCHITECTURE_REL_PATH = "\docs\eggbert_architecture.md"
EGGBERT_ARCHITECTURE_ABSOLUTE_PATH = os.getcwd() + EGGBERT_ARCHITECTURE_REL_PATH


def get_curr_file_structure_text():
    with open(EGGBERT_ARCHITECTURE_ABSOLUTE_PATH, "r") as f:
        print(f.read())


def main():
    if not os.getcwd().endswith("eggbert-analytics"):
        print(
            "Please only commit from the eggbert-analytics directory. The hooks are not configured to work from anywhere else."
        )


if __name__ == "__main__":

    main()
