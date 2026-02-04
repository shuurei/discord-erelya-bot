import { SymbolsUI } from '@/ui/SymbolsUI'
import pc from 'picocolors'

export type ColorAPI = typeof pc

export type LoggerTextInput = string | ((color: ColorAPI) => string | undefined)

export type LoggerOptions = {
    prefix?: LoggerTextInput
}

export type LoggerBoxOptions = {
    title?: LoggerTextInput
    message: LoggerTextInput
    bottomTitle?: LoggerTextInput
}

export class Logger {
    private prefix?: string

    constructor(options?: LoggerOptions) {
        this.prefix = this.resolveText(options?.prefix)
    }

    use(options?: LoggerOptions): Logger {
        return new Logger({
            prefix: options?.prefix ?? this.prefix
        })
    }

    private format(type: string, ...message: unknown[]) {
        const parts = [this.prefix, type, ...message].filter(Boolean)
        console.log(...parts)
    }

    private resolveText(text?: LoggerTextInput): string | undefined {
        if (!text) return undefined
        return typeof text === 'function' ? text(pc) : text
    }

    log(...message: unknown[]) {
        this.format('', ...message)
    }

    info(...message: unknown[]) {
        this.format(pc.bold(pc.cyan('[INFO]')), ...message)
    }

    warn(...message: unknown[]) {
        this.format(pc.bold(pc.yellow('[WARN]')), ...message)
    }

    error(...message: unknown[]) {
        this.format(pc.bold(pc.red('[ERROR]')), ...message)
    }

    success(...message: unknown[]) {
        this.format(pc.bold(pc.green('[SUCCESS]')), ...message)
    }

    topBorderBox(title?: LoggerTextInput) {
        const cornerTopLeft = pc.yellow(SymbolsUI.box.cornerTopLeft)
        const star = pc.yellow(SymbolsUI.pointedStar)

        const resolvedText = this.resolveText(title)

        const parts = [`${cornerTopLeft} ${star}`]
        if (resolvedText) {
            parts.push(`${resolvedText} ${star}`)
        }

        console.log(parts.join(' '))
    }

    borderBox(text: LoggerTextInput) {
        const vertical = pc.yellow(SymbolsUI.box.vertical)
        const resolvedText = this.resolveText(text)

        console.log(`${vertical} ${resolvedText}`)
    }

    bottomBorderBox(title?: LoggerTextInput) {
        const cornerBottomLeft = pc.yellow(SymbolsUI.box.cornerBottomLeft)
        const star = pc.yellow(SymbolsUI.pointedStar)

        const resolvedText = this.resolveText(title)

        const parts = [`${cornerBottomLeft} ${star}`]
        if (resolvedText) {
            parts.push(`${resolvedText} ${star}`)
        }

        console.log(parts.join(' '))
    }

    box(options: LoggerTextInput | LoggerBoxOptions) {
        let title: LoggerTextInput | undefined
        let message: LoggerTextInput
        let bottomTitle: LoggerTextInput | undefined

        if (typeof options === 'string' || typeof options === 'function') {
            message = options
        } else {
            title = options.title
            message = options.message
            bottomTitle = options.bottomTitle
        }

        this.topBorderBox(title)
        this.borderBox(message)
        this.bottomBorderBox(bottomTitle)
    }
}