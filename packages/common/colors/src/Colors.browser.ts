import {Colors, type Formatter} from "./Colors.ts";

const identity: Formatter = input => String(input)

const createColors = (): Colors => new Colors({
	isColorSupported: false,
	reset: identity,
	bold: identity,
	dim: identity,
	italic: identity,
	underline: identity,
	inverse: identity,
	hidden: identity,
	strikethrough: identity,
	black: identity,
	red: identity,
	green: identity,
	yellow: identity,
	blue: identity,
	magenta: identity,
	cyan: identity,
	white: identity,
	gray: identity,
	bgBlack: identity,
	bgRed: identity,
	bgGreen: identity,
	bgYellow: identity,
	bgBlue: identity,
	bgMagenta: identity,
	bgCyan: identity,
	bgWhite: identity,
	blackBright: identity,
	redBright: identity,
	greenBright: identity,
	yellowBright: identity,
	blueBright: identity,
	magentaBright: identity,
	cyanBright: identity,
	whiteBright: identity,
	bgBlackBright: identity,
	bgRedBright: identity,
	bgGreenBright: identity,
	bgYellowBright: identity,
	bgBlueBright: identity,
	bgMagentaBright: identity,
	bgCyanBright: identity,
	bgWhiteBright: identity,
})

const colors = createColors();

export default colors;
