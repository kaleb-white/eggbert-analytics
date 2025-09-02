import subprocess, sys


def main():

    print("Beginning Next process...")
    subprocess.run(["next", "dev", "--turbopack"], shell=True)


if __name__ == "__main__":
    main()
