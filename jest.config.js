module.exports = {
    roots: ["./"],
    testMatch: [
        "**/tests/**/*.+(ts|tsx|js)"
    ],
    transform: {
        "^.+\\.(ts|tsx)$": "ts-jest"
    }
}