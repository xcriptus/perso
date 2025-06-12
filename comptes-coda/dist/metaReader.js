"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseField = parseField;
function parseField(value, field) {
    if (field.type === "string[]") {
        return (value || "")
            .split(field.separator)
            .map((s) => s.trim())
            .filter((s) => s.length > 0);
    }
    if (field.type === "number[]") {
        return (value || "")
            .split(field.separator)
            .map((s) => parseInt(s.trim(), 10))
            .filter((n) => !isNaN(n));
    }
    if (field.type === "number") {
        return value !== undefined && value !== null && value !== "" ? parseFloat(value) : 0;
    }
    if (field.type === "date") {
        return value ? new Date(value) : undefined;
    }
    // string (par défaut)
    return value || "";
}
