import { SyncSubprocess } from "bun";
import { existsSync } from "fs";

enum OperatingSystems {
    WINDOWS = "win32",
    LINUX = "linux",
    MAC = "darwin",
}

function determineOS(): OperatingSystems {
    const os = process.platform;
    switch (os) {
        case OperatingSystems.WINDOWS:
            return OperatingSystems.WINDOWS;
        case OperatingSystems.LINUX:
            return OperatingSystems.LINUX;
        case OperatingSystems.MAC:
            return OperatingSystems.MAC;
    }
    return OperatingSystems.WINDOWS;
}

function findDockerDesktopWindows(): string[] {
    const commonPaths = [
        "C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe",
        "C:\\Program Files (x86)\\Docker\\Docker\\Docker Desktop.exe",
        process.env.LOCALAPPDATA + "\\Docker\\Docker Desktop.exe",
        process.env.PROGRAMFILES + "\\Docker\\Docker\\Docker Desktop.exe",
        process.env["PROGRAMFILES(X86)"] +
            "\\Docker\\Docker\\Docker Desktop.exe",
    ];

    return commonPaths.filter((path) => existsSync(path));
}

function runDockerDesktopExecutableWindows(): SyncSubprocess | Error {
    const dockerPath = findDockerDesktopWindows();
    if (dockerPath.length == 0)
        return new Error(
            "No docker desktop executable found! If you have docker desktop and this error is showing up, please start docker desktop and run the script again."
        );

    return Bun.spawnSync({ cmd: [dockerPath[0]] });
}

// function findDockerDesktopMac(): string[] {
//     const commonPaths = [
//         "/Applications/Docker.app/Contents/MacOS/Docker",
//         "/Applications/Docker.app/Contents/MacOS/com.docker.docker",
//         "/usr/local/bin/docker",
//         "/opt/homebrew/bin/docker", // For Apple Silicon Homebrew
//     ];

//     return commonPaths.filter((path) => existsSync(path));
// }

export function runDockerStartCommandBasedOnOS(): SyncSubprocess | Error {
    const os = determineOS();
    switch (os) {
        case OperatingSystems.LINUX:
            return Bun.spawnSync(["sudo", "systemctl", "start", "docker"]);
        case OperatingSystems.MAC:
            return Bun.spawnSync(["open", "-a", "Docker"]);
        case OperatingSystems.WINDOWS:
            return runDockerDesktopExecutableWindows();
        default:
            return new Error(
                `Operating system unsupported! Only the systems ${Object.keys(
                    OperatingSystems
                ).join(" ")} are supported.`
            );
    }
}
