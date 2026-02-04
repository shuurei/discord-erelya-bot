import chroma from 'chroma-js'
import {
    createCanvas,
    loadImage,
    SKRSContext2D,
    Path2D
} from '@napi-rs/canvas'

import { isEmoji } from './string'

interface GetDominantColorBaseOptions {
    minLuminance?: number;
}

interface GetDominantColorRGBOptions extends GetDominantColorBaseOptions {
    returnRGB?: true;
}

interface GetDominantColorHexOptions extends GetDominantColorBaseOptions {
    returnRGB: false;
}

export async function getDominantColor(imgURL: string, options?: GetDominantColorRGBOptions): Promise<number>;
export async function getDominantColor(imgURL: string, options: GetDominantColorHexOptions): Promise<string>;
export async function getDominantColor(
    imgURL: string,
    {
        returnRGB = true,
        minLuminance = 0.4
    }: GetDominantColorRGBOptions | GetDominantColorHexOptions = {}
): Promise<number | string> {
    try {
        const img = await loadImage(imgURL)
        const canvas = createCanvas(img.width, img.height)
        const ctx = canvas.getContext('2d')

        ctx.drawImage(img, 0, 0, img.width, img.height)
        const data = ctx.getImageData(0, 0, img.width, img.height).data

        let r = 0, g = 0, b = 0, count = 0
        for (let i = 0; i < data.length; i += 4) {
            r += data[i]
            g += data[i + 1]
            b += data[i + 2]
            count++
        }

        r = Math.round(r / count)
        g = Math.round(g / count)
        b = Math.round(b / count)

        let color = chroma.rgb(r, g, b)

        let [L, a, b2] = color.oklab()
        if (L < minLuminance) {
            color = chroma.oklab(minLuminance, a, b2)
        }

        return returnRGB
            ? color.num()
            : color.hex().toUpperCase();
    } catch (err) {
        console.error(err)
        return returnRGB ? 0x000000 : '#000000'
    }
}

export const svgToBase64 = (svg: string) => {
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

type Rect = { x: number; y: number; w: number; h: number };

interface DrawRandomRectsOptions {
    amount: number;
    colors: string[];
    widthRange: [number, number];
    heightRange: [number, number];
    margin?: number;
    opacityRange?: [number, number];
}

interface RandomRectsOptions {
    canvasWidth: number;
    canvasHeight: number;
    amount?: number;
    colors: string[];
    width?: number;
    maxWidth?: number;
    height?: number;
    maxHeight?: number;
    margin?: number;
    opacityRange?: [number, number];
}

export const drawRandomRects = (ctx: SKRSContext2D, options: RandomRectsOptions): Rect[] => {
    const {
        canvasWidth,
        canvasHeight,
        colors,
        amount = 12,
        width = 5,
        maxWidth = 20,
        height = 5,
        maxHeight = 15,
        margin = 10,
        opacityRange = [70, 255]
    } = options;

    const placedRects: Rect[] = [];

    for (let i = 0; i < amount; i++) {
        let x: number, y: number;

        const w = maxWidth ? Math.random() * (maxWidth - width) + width : width;
        const h = maxHeight ? Math.random() * (maxHeight - height) + height : height;

        const repelFactor = i / amount;

        const isHorizontal = Math.random() < 0.5;
        if (isHorizontal) {
            x = Math.random() < 0.5
                ? margin - w - Math.random() * 10 * repelFactor
                : canvasWidth - margin + Math.random() * 10 * repelFactor;
            y = Math.random() * (canvasHeight - 2 * margin) + margin;
        } else {
            x = Math.random() * (canvasWidth - 2 * margin) + margin;
            y = Math.random() < 0.5
                ? margin - h - Math.random() * 10 * repelFactor
                : canvasHeight - margin + Math.random() * 10 * repelFactor;
        }

        x += (Math.random() - 0.5) * 6;
        y += (Math.random() - 0.5) * 6;

        const baseColor = colors[Math.floor(Math.random() * colors.length)];
        const opacity = Math.floor(Math.random() * (opacityRange[1] - opacityRange[0]) + opacityRange[0])
            .toString(16)
            .padStart(2, '0');

        ctx.fillStyle = baseColor + opacity;
        ctx.fillRect(x, y, w, h);

        placedRects.push({ x, y, w, h });
    }

    return placedRects;
};

interface DrawTextBlockOptions {
    x: number
    y: number
    maxWidth: number
    font: string
    fontSize?: number
    fillStyle?: string
    lineHeight?: number
    align?: CanvasTextAlign
    baseline?: CanvasTextBaseline
    centerVertically?: boolean
    shadow?: {
        color: string
        blur: number
        offsetX?: number
        offsetY?: number
    }
}

export const drawTextBlock = (
    ctx: SKRSContext2D,
    text: string,
    options: DrawTextBlockOptions
) => {
    const {
        x,
        y,
        maxWidth,
        font,
        fillStyle = '#FFF',
        fontSize = 16,
        align = 'left',
        baseline = 'alphabetic',
        centerVertically = false,
        shadow
    } = options;

    ctx.save();
    ctx.font = `${fontSize}px ${font}`;
    ctx.fillStyle = fillStyle;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;

    if (shadow) {
        ctx.shadowColor = shadow.color;
        ctx.shadowBlur = shadow.blur;
        ctx.shadowOffsetX = shadow.offsetX ?? 0;
        ctx.shadowOffsetY = shadow.offsetY ?? 0;
    }

    const lineHeight = options.lineHeight ?? fontSize * 1.2;
    const lines: string[] = [];

    const words = text.split(' ');

    for (const word of words) {
        const chars = [...word].map(c => (ctx.measureText(c).width === 0 || isEmoji(c) ? '?' : c));
        const safeWord = chars.join('');

        const lastLineIndex = lines.length - 1;
        const prevLine = lastLineIndex >= 0 ? lines[lastLineIndex] : '';
        const testLine = prevLine ? prevLine + ' ' + safeWord : safeWord;

        if (ctx.measureText(testLine).width > maxWidth) {
            let currentLine = '';

            for (const char of safeWord) {
                const testCharLine = currentLine + char;
                if (ctx.measureText(testCharLine).width > maxWidth) {
                    if (currentLine) lines.push(currentLine);
                    currentLine = char;
                } else {
                    currentLine = testCharLine;
                }
            }

            if (currentLine) {
                lines.push(currentLine);
            }
        } else {
            if (prevLine) {
                lines[lastLineIndex] = prevLine + ' ' + safeWord;
            } else {
                lines.push(safeWord);
            }
        }
    }


    let startY = y;
    if (centerVertically) {
        startY = y - ((lines.length - 1) * lineHeight) / 2;
    }

    lines.forEach((lineText, i) => {
        ctx.fillText(lineText, x, startY + i * lineHeight);
    });

    ctx.restore();

    return lines;
};

interface CreateBevelPathOptions {
    width: number;
    height: number;
    topLeft: number;
    topRight: number;
    bottomLeft: number;
    bottomRight: number;
    margin?: number;
}

export const createBevelPath = (options: CreateBevelPathOptions) => {
    const {
        width,
        height,
        topLeft,
        topRight,
        bottomLeft,
        bottomRight,
        margin = 0
    } = options

    const path = new Path2D();

    path.moveTo(margin + topLeft, margin);
    path.lineTo(width - margin - topRight, margin);
    path.lineTo(width - margin, margin + topRight);
    path.lineTo(width - margin, height - margin - bottomRight);
    path.lineTo(width - margin - bottomRight, height - margin);
    path.lineTo(margin + bottomLeft, height - margin);
    path.lineTo(margin, height - margin - bottomLeft);
    path.lineTo(margin, margin + topLeft);
    path.closePath();

    return path;
}