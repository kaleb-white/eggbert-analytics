export type ThemeColor =
    | "success"
    | "failure"
    | "info"
    | "warning"
    | "primary"
    | "secondary"
    | "tertiary"
    | "disabled";

export type ThemeColorVariationsNoSubtle =
    | ThemeColor
    | "success-bold"
    | "failure-bold"
    | "info-bold"
    | "warning-bold"
    | "primary-bold"
    | "secondary-bold"
    | "tertiary-bold"
    | "disabled-bold";

export type ThemeColorVariations =
    | ThemeColorVariationsNoSubtle
    | "success-subtle"
    | "failure-subtle"
    | "info-subtle"
    | "warning-subtle"
    | "primary-subtle"
    | "secondary-subtle"
    | "tertiary-subtle"
    | "disabled-subtle";

export enum ThemeColorHex {
    "success" = "#77ba99",
    "success-bold" = "#02c789",
    "failure" = "#d33f49",
    "failure-bold" = "#e70237",
    "info" = "#eff0d1",
    "info-bold" = "#f6f575",
    "warning" = "#483c46",
    "warning-bold" = "#6a1263",
    "primary" = "#f0f3f5",
    "primary-bold" = "#e6f5ff",
    "secondary" = "#dcdfe0",
    "secondary-bold" = "#c6e5ef",
    "tertiary" = "#8dcce0",
    "tertiary-bold" = "#28d5ff",
    "disabled" = "#978994",
    "disabled-bold" = "#3c313a",
}

export enum ThemeColorBorder {
    "success" = "border-success",
    "success-bold" = "border-success-bold",
    "failure" = "border-failure",
    "failure-bold" = "border-failure-bold",
    "info" = "border-info",
    "info-bold" = "border-info-bold",
    "warning" = "border-warning",
    "warning-bold" = "border-warning-bold",
    "primary" = "border-primary",
    "primary-bold" = "border-primary-bold",
    "secondary" = "border-secondary",
    "secondary-bold" = "border-secondary-bold",
    "tertiary" = "border-tertiary",
    "tertiary-bold" = "border-tertiary-bold",
    "disabled" = "border-disabled",
    "disabled-bold" = "border-disabled-bold",
}
