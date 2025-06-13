export class Validation {

    static range<T>(value: T, fieldName: string, min: number, max: number): string | null {
        if (typeof value === "string") {
            const message = `${fieldName} måste vara mellan ${min} och ${max} tecken långt.`;
            return value.length < min || value.length > max ? message : null;
        }

        if (typeof value === "number") {
            const message = `${fieldName} måste vara mellan ${min} och ${max}.`;
            return value < min || value > max ? message : null;
        }

        return `${fieldName} har otillåten datatyp.`;
    }

    static unableToContainNumbers(value: string, fieldName: string): string | null {
        const message = `${fieldName} får inte innehålla nummer.`;
        return /\d/.test(value) ? message : null;
    }

    static unableToContainSpecialChar(value: string, fieldName: string): string | null {
        const message = `${fieldName} får inte innehålla specialtecken (!@#$%^&* och liknande).`;
        return  /[^\p{L}0-9_ -]/u.test(value) ? message : null;
    }

    static email(value: string, fieldName: string): string | null {
        const message = `${fieldName} måste ha en korrekt formatterad e-post.`;
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? message : null;
    }

    static passwordSmallChar(value: string): string | null {
        const message = "Lösenordet måste innehålla en liten bokstav.";
        return !/[a-z]/.test(value) ? message : null;
    }

    static passwordCapitalChar(value: string): string | null {
        const message = "Lösenordet måste innehålla en stor bokstav.";
        return !/[A-Z]/.test(value) ? message : null;
    }

    static passwordNumber(value: string): string | null {
        const message = "Lösenordet måste innehålla en siffra.";
        return !/\d/.test(value) ? message : null;
    }

    static passwordSpecialChar(value: string): string | null {
        const message = "Lösenordet måste innehålla ett special tecken (!@#$%^&*).";
        return !/[!@#$%^&*]/.test(value) ? message : null;
    }

    static passwordLength(value: string): string | null {
        const message = "Lösenordet är för kort. Minst åtta tecken långt.";
        return value.length < 8 ? message : null;
    }

    static filterPossibleInjection(value: string, fieldName: string): string | null {
        const message = `Din ${fieldName} innehåller potentiellt skadlig kod.`;
        return /<\s*\/?\s*(script|iframe|style|object|embed|form|input|img|svg|link|meta)\b|on\w+\s*=|javascript:/i.test(value) ? message : null;
    }

    static correctPriceFormat(value: string): string | null {
        const message = "Pris måste vara ett tal, punkt istället för komma för decimaler.";
        return !/^\d+([.]\d{1,2})?$/.test(value) ? message : null;
    }
}
