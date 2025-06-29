#!/usr/bin/env node

/**
 * CLI Password Strength Checker
 * 
 * Checks the strength of a password entered by the user.
 * Usage:
 *    node check-password.js [password]
 * 
 * If no password argument is provided, it prompts the user to enter one securely.
 * 
 * Strength Levels:
 *  - Very Weak
 *  - Weak
 *  - Medium
 *  - Strong
 *  - Very Strong
 * 
 * Criteria considered:
 *  - Length
 *  - Uppercase letters
 *  - Lowercase letters
 *  - Digits
 *  - Special characters
 */

const readline = require('readline');

function evaluatePasswordStrength(password) {
    let score = 0;
    const feedback = [];

    if (password.length >= 12) {
        score += 3;
    } else if (password.length >= 8) {
        score += 2;
    } else if (password.length >= 5) {
        score += 1;
    } else {
        score += 0;
        feedback.push('Password is too short (minimum 5 characters).');
    }

    if (/[A-Z]/.test(password)) {
        score += 2;
    } else {
        feedback.push('Add uppercase letters.');
    }

    if (/[a-z]/.test(password)) {
        score += 2;
    } else {
        feedback.push('Add lowercase letters.');
    }

    if (/\d/.test(password)) {
        score += 2;
    } else {
        feedback.push('Add digits.');
    }

    if (/[^A-Za-z0-9]/.test(password)) {
        score += 3;
    } else {
        feedback.push('Add special characters (e.g., @, #, $, %).');
    }

    // Cap max score 12
    if (score > 12) score = 12;

    let strength = '';
    switch (true) {
        case (score <= 3):
            strength = 'Very Weak';
            break;
        case (score <= 6):
            strength = 'Weak';
            break;
        case (score <= 8):
            strength = 'Medium';
            break;
        case (score <= 10):
            strength = 'Strong';
            break;
        case (score <= 12):
            strength = 'Very Strong';
            break;
    }

    return { score, strength, feedback };
}

// Color output utility without external dependencies
const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    cyan: "\x1b[36m",
};

// Map strength to colors
function colorizeStrength(strength) {
    switch (strength) {
        case 'Very Weak': return colors.red + strength + colors.reset;
        case 'Weak': return colors.yellow + strength + colors.reset;
        case 'Medium': return colors.cyan + strength + colors.reset;
        case 'Strong': return colors.green + strength + colors.reset;
        case 'Very Strong': return colors.bright + colors.green + strength + colors.reset;
        default: return strength;
    }
}

function promptPassword() {
    return new Promise((resolve) => {
        // Hide input while typing for security
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: true
        });
        const stdin = process.openStdin();
        process.stdout.write('Enter password: ');
        let password = '';
        // Hide input characters
        stdin.on('data', (char) => {
            char = char + "";
            switch (char) {
                case "\n":
                case "\r":
                case "\u0004":
                    stdin.pause();
                    break;
                default:
                    process.stdout.write("*");
                    password += char;
                    break;
            }
        });
        stdin.on('end', () => {
            rl.close();
            resolve(password.trim());
        });
        rl.on('close', () => {
            resolve(password.trim());
        });
    });
}

async function main() {
    let password = process.argv[2];

    if (!password) {
        // No password argument, prompt user
        password = await promptPassword();
        console.log(); // Newline after input
    }

    if (!password) {
        console.log(colors.red + 'No password entered. Exiting.' + colors.reset);
        process.exit(1);
    }

    const { score, strength, feedback } = evaluatePasswordStrength(password);

    console.log(`Password Strength: ${colorizeStrength(strength)}`);
    console.log(`Score: ${score} / 12`);

    if (feedback.length) {
        console.log('\nSuggestions to improve your password:');
        feedback.forEach((item) => {
            console.log(`- ${item}`);
        });
    } else {
        console.log('\nYour password is strong. Great job!');
    }
}

// Only run main if executed directly
if (require.main === module) {
    main();
}
