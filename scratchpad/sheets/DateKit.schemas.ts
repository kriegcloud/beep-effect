import {$ScratchpadId} from "@beep/identity";
import * as S from "effect/Schema";
import {createInvalidDateTime, LiteralKit} from "@beep/schema";
import * as DateTime from "effect/DateTime";
import {pipe} from "effect/Function";
import * as O from "effect/Option";
import type * as R from "effect/Record";
import * as Str from "effect/String";
import { P } from "@beep/utils";

const $I = $ScratchpadId.create("sheets/DateKit.schemas");

export const DateKitCoreUnit = LiteralKit([
	'millisecond',
	'second',
	'minute',
	'hour',
	'day',
	'week',
	'month',
	'year',
]).pipe($I.annoteSchema("DateKitCoreUnit", {
	description: "The core units of a date",
}));

export type DateKitCoreUnit = typeof DateKitCoreUnit.Type;

export const DateKitUnitType = LiteralKit([
	...DateKitCoreUnit.Options,
	"milliseconds",
	"ms",
	"seconds",
	"s",
	"minutes",
	"m",
	"hours",
	"h",
	"days",
	"d",
	"weeks",
	"w",
	"months",
	"M",
	"years",
	"y",
]).pipe($I.annoteSchema("DateKitUnitType", {
	description: "The units of a date",
}))

export type DateKitUnitType = typeof DateKitUnitType.Type;


export const MonthName = LiteralKit([
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
]).pipe($I.annoteSchema("MonthName", {
	description: "The names of the months of the year",
}))

export type MonthName = typeof MonthName.Type;

export const MonthNameShort = LiteralKit([
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'May',
	'Jun',
	'Jul',
	'Aug',
	'Sep',
	'Oct',
	'Nov',
	'Dec',
]).pipe($I.annoteSchema("MonthNameShort", {
	description: "The short names of the months of the year",
}))

export type MonthNameShort = typeof MonthNameShort.Type;

export const WeekDayName = LiteralKit([
	'Sunday',
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday',
]).pipe($I.annoteSchema("WeekDayName", {
	description: "The names of the days of the week",
}))

export type WeekDayName = typeof WeekDayName.Type;

export const WeekDayNameShort = LiteralKit([
	'Sun',
	'Mon',
	'Tue',
	'Wed',
	'Thu',
	'Fri',
	'Sat',
]).pipe($I.annoteSchema("WeekDayNameShort", {
	description: "The short names of the days of the week",
}))

export type WeekDayNameShort = typeof WeekDayNameShort.Type;

export const WeekDayNameMin = LiteralKit([
	'Su',
	'Mo',
	'Tu',
	'We',
	'Th',
	'Fr',
	'Sa',
]).pipe($I.annoteSchema("WeekDayNameMin", {
	description: "The minimum names of the days of the week",
}));

export type WeekDayNameMin = typeof WeekDayNameMin.Type;

const MILLISECOND = 1;
const SECOND = 1000 * MILLISECOND;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK_START_DAY = 0; // Sunday
const LOCAL_TIMEZONE = DateTime.zoneMakeLocal();

const LOCALIZED_FORMAT_MAP: Record<string, string> = {
	L: 'MM/DD/YYYY',
	LL: 'MMMM D, YYYY',
	LLL: 'MMMM D, YYYY h:mm A',
	LLLL: 'dddd, MMMM D, YYYY h:mm A',
	l: 'M/D/YYYY',
	ll: 'MMM D, YYYY',
	lll: 'MMM D, YYYY h:mm A',
	llll: 'ddd, MMM D, YYYY h:mm A',
};

const UNIT_ALIASES: R.ReadonlyRecord<string, DateKitCoreUnit> = {
	millisecond: 'millisecond',
	milliseconds: 'millisecond',
	ms: 'millisecond',
	second: 'second',
	seconds: 'second',
	s: 'second',
	minute: 'minute',
	minutes: 'minute',
	m: 'minute',
	hour: 'hour',
	hours: 'hour',
	h: 'hour',
	day: 'day',
	days: 'day',
	d: 'day',
	week: 'week',
	weeks: 'week',
	w: 'week',
	month: 'month',
	months: 'month',
	M: 'month',
	year: 'year',
	years: 'year',
	y: 'year',
}

export class DateParts extends S.Class<DateParts>($I`DateParts`)({
	year: S.Finite,
	month: S.Finite.check(S.isBetween({
		minimum: 1,
		maximum: 12,
	})),
	day: S.Finite.check(S.isBetween({
		minimum: 1,
		maximum: 31,
	})),
	hour: S.Finite.check(S.isBetween({
		minimum: 0,
		maximum: 23,
	})),
	minute: S.Finite.check(S.isBetween({
		minimum: 0,
		maximum: 59,
	})),
	second: S.Finite.check(S.isBetween({
		minimum: 0,
		maximum: 59,
	})),
	millisecond: S.Finite.check(S.isBetween({
		minimum: 0,
		maximum: 999,
	})),
	dayOfWeek: S.Finite.check(S.isBetween({
		minimum: 0,
		maximum: 6,
	})),
}, $I.annote("DateParts", {
	description: "A class for representing date parts",
})) {
}

const DateKitDateTime = S.Union([
	S.DateTimeUtc,
	S.DateTimeZoned,
]).pipe($I.annoteSchema("DateKitDateTime", {
	description: "Effect DateTime value used by DateKit",
}));

export class DateKit extends S.Class<DateKit>($I`DateKit`)({
	_date: DateKitDateTime,
	_isUTC: S.Boolean,
}, $I.annote("DateKit", {
	description: "A class for representing date parts",
})) {
	static readonly new = (_date: DateTime.DateTime, _isUTC: boolean) => DateKit.make({
		_date: applyDateKitZone(_date, _isUTC),
		_isUTC,
	})

	readonly isValid = () => isDateTimeValid(this._date)

	format(template = 'YYYY-MM-DDTHH:mm:ssZ') {
		if (!this.isValid()) {
			return 'Invalid Date';
		}
		return formatDate(this._date, template, this._isUTC);
	}

	override valueOf() {
		return DateTime.toEpochMillis(this._date);
	}

	toDate() {
		return DateTime.toDateUtc(this._date);
	}

	private _clone() {
		return DateKit.make({
			_date: this._date,
			_isUTC: this._isUTC,
		});
	}

	add(value: number, unit: DateKitUnitType = 'millisecond') {
		const normalizedUnit = normalizeUnit(unit);
		if (!this.isValid() || !P.isTruthy(normalizedUnit) || !Number.isFinite(value)) {
			return this._clone();
		}
		return DateKit.new(addDate(this._date, value, normalizedUnit, this._isUTC), this._isUTC);
	}

	subtract(value: number, unit: DateKitUnitType = 'millisecond') {
		return this.add(-value, unit);
	}

	startOf(unit: DateKitUnitType) {
		const normalizedUnit = normalizeUnit(unit);
		if (!P.isTruthy(normalizedUnit) || !this.isValid()) {
			return this._clone();
		}
		return DateKit.new(startOf(this._date, normalizedUnit, this._isUTC), this._isUTC);
	}

	endOf(unit: DateKitUnitType) {
		const normalizedUnit = normalizeUnit(unit);
		if (!P.isTruthy(normalizedUnit) || !this.isValid()) {
			return this._clone();
		}
		if (normalizedUnit === 'millisecond') {
			return this._clone();
		}
		return this.startOf(normalizedUnit).add(1, normalizedUnit).subtract(1, 'millisecond');
	}

	utc() {
		return DateKit.make({
			_date: applyDateKitZone(this._date, true),
			_isUTC: true,
		});
	}

	local() {
		return DateKit.make({
			_date: applyDateKitZone(this._date, false),
			_isUTC: false,
		});
	}

	weekday(): number;
	weekday(value: number): DateKit;
	weekday(value?: number): number | DateKit {
		const day = getDateParts(this._date, this._isUTC).dayOfWeek;
		const current = (day - WEEK_START_DAY + 7) % 7;
		if (value === undefined) {
			return current;
		}
		return this.add(value - current, 'day');
	}

	week(): number;
	week(value: number): DateKit;
	week(value?: number): number | DateKit {
		const currentWeek = getWeekOfYear(this._date, this._isUTC);
		if (value === undefined) {
			return currentWeek;
		}
		return this.add((value - currentWeek) * 7, 'day');
	}
}

export const DateKitInput = S.Union([
	S.Date,
	DateKitDateTime,
	S.Finite,
	S.String,
	S.Null,
	S.Undefined,
	DateKit,
]);

export type DateKitInput = typeof DateKitInput.Type;

function pad(value: number, length = 2) {
	return String(Math.abs(value)).padStart(length, '0');
}

function isDateTimeValid(dateTime: DateTime.DateTime) {
	return !Number.isNaN(DateTime.toEpochMillis(dateTime));
}

function applyDateKitZone(dateTime: DateTime.DateTime, isUTC: boolean) {
	if (!isDateTimeValid(dateTime)) {
		return dateTime;
	}
	return isUTC
		? DateTime.toUtc(dateTime)
		: DateTime.setZone(dateTime, LOCAL_TIMEZONE);
}

function fromDateTimeInput(input: DateTime.DateTime.Input, isUTC: boolean) {
	return pipe(
		DateTime.make(input),
		O.map((dateTime) => applyDateKitZone(dateTime, isUTC)),
		O.getOrElse(createInvalidDateTime),
	);
}

function fromEpochMilliseconds(epochMilliseconds: number, isUTC: boolean) {
	return Number.isFinite(epochMilliseconds)
		? fromDateTimeInput({ epochMilliseconds }, isUTC)
		: createInvalidDateTime();
}

function getDateParts(date: DateTime.DateTime, isUTC: boolean): DateParts {
	if (!isDateTimeValid(date)) {
		return {
			year: Number.NaN,
			month: Number.NaN,
			day: Number.NaN,
			hour: Number.NaN,
			minute: Number.NaN,
			second: Number.NaN,
			millisecond: Number.NaN,
			dayOfWeek: Number.NaN,
		};
	}
	const parts = isUTC
		? DateTime.toPartsUtc(date)
		: DateTime.toParts(applyDateKitZone(date, false));
	return {
		year: parts.year,
		month: parts.month,
		day: parts.day,
		hour: parts.hour,
		minute: parts.minute,
		second: parts.second,
		millisecond: parts.millisecond,
		dayOfWeek: parts.weekDay,
	};
}

function toDateTime(input: DateKitInput, isUTC: boolean) {
	if (S.is(DateKit)(input)) {
		return applyDateKitZone(input._date, isUTC);
	}
	if (input === undefined) {
		return applyDateKitZone(DateTime.nowUnsafe(), isUTC);
	}
	if (input === null) {
		return createInvalidDateTime();
	}
	if (DateTime.isDateTime(input)) {
		return applyDateKitZone(input, isUTC);
	}
	if (input instanceof Date) {
		return fromDateTimeInput(input, isUTC);
	}
	if (typeof input === 'number') {
		return fromEpochMilliseconds(input, isUTC);
	}
	if (typeof input === 'string') {
		return parseDateString(input, isUTC);
	}
	return createInvalidDateTime();
}

function createDateWithParts(
	year: number,
	month: number,
	day: number,
	hour: number,
	minute: number,
	second: number,
	millisecond: number,
	isUTC: boolean,
) {
	const input = { year, month, day, hour, minute, second, millisecond };
	const matchesInputParts = (parsed: DateTime.DateTime) => {
		const parts = getDateParts(parsed, isUTC);
		return parts.year === year
			&& parts.month === month
			&& parts.day === day
			&& parts.hour === hour
			&& parts.minute === minute
			&& parts.second === second
			&& parts.millisecond === millisecond;
	}
	if (isUTC) {
		return pipe(
			DateTime.make(input),
			O.filter(matchesInputParts),
			O.getOrElse(createInvalidDateTime),
		);
	}
	return pipe(
		DateTime.makeZoned(input, {
			timeZone: LOCAL_TIMEZONE,
			adjustForTimeZone: true,
		}),
		O.filter(matchesInputParts),
		O.getOrElse(createInvalidDateTime),
	);
}

function parseDateString(input: string, isUTC: boolean) {
	const text = input.trim();
	if (Str.isEmpty(text)) {
		return createInvalidDateTime();
	}

	const cjkMatch = text.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日(?:\s+(\d{1,2})(?::(\d{1,2})(?::(\d{1,2}))?)?)?$/);
	if (cjkMatch !== null) {
		const [, y, m, d, hh = '0', mm = '0', ss = '0'] = cjkMatch;
		return createDateWithParts(Number(y), Number(m), Number(d), Number(hh), Number(mm), Number(ss), 0, isUTC);
	}

	const standardMatch = text.match(
		/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[ T](\d{1,2})(?::(\d{1,2})(?::(\d{1,2})(?:\.(\d{1,3}))?)?)?)?$/);
	if (standardMatch !== null) {
		const [, y, m, d, hh = '0', mm = '0', ss = '0', mss = '0'] = standardMatch;
		return createDateWithParts(Number(y), Number(m), Number(d), Number(hh), Number(mm), Number(ss), Number(mss), isUTC);
	}

	if (/^-?\d+(\.\d+)?$/.test(text)) {
		return fromEpochMilliseconds(Number(text), isUTC);
	}

	return fromDateTimeInput(text, isUTC);
}

function normalizeUnit(unit: DateKitUnitType) {
	return UNIT_ALIASES[unit] ?? UNIT_ALIASES[String(unit).toLowerCase()];
}

const DATE_TIME_MATH_PARTS: R.ReadonlyRecord<DateKitCoreUnit, (value: number) => Partial<DateTime.DateTime.PartsForMath>> = {
	millisecond: (value) => ({ milliseconds: value }),
	second: (value) => ({ seconds: value }),
	minute: (value) => ({ minutes: value }),
	hour: (value) => ({ hours: value }),
	day: (value) => ({ days: value }),
	week: (value) => ({ weeks: value }),
	month: (value) => ({ months: value }),
	year: (value) => ({ years: value }),
}

function addDate(date: DateTime.DateTime, value: number, unit: DateKitCoreUnit, isUTC: boolean) {
	return DateTime.add(applyDateKitZone(date, isUTC), DATE_TIME_MATH_PARTS[unit](value));
}

function startOf(date: DateTime.DateTime, unit: DateKitCoreUnit, isUTC: boolean) {
	return DateTime.startOf(applyDateKitZone(date, isUTC), unit, {
		weekStartsOn: WEEK_START_DAY,
	});
}

function getWeekOfYear(date: DateTime.DateTime, isUTC: boolean) {
	if (!isDateTimeValid(date)) {
		return Number.NaN;
	}
	const currentWeekStart = startOf(date, 'week', isUTC);
	const yearStart = startOf(date, 'year', isUTC);
	const firstWeekStart = startOf(yearStart, 'week', isUTC);
	return Math.floor((DateTime.toEpochMillis(currentWeekStart) - DateTime.toEpochMillis(firstWeekStart)) / DAY / 7) + 1;
}

function getTimezoneString(date: DateTime.DateTime, isUTC: boolean, compact = false) {
	if (isUTC) {
		return compact
			? '+0000'
			: '+00:00';
	}
	const offset = DateTime.zonedOffsetIso(DateTime.setZone(date, LOCAL_TIMEZONE));
	return compact
		? offset.replace(':', '')
		: offset;
}

function ordinal(value: number) {
	const v = value % 100;
	if (v >= 11 && v <= 13) {
		return `${value}th`;
	}
	switch (value % 10) {
		case 1:
			return `${value}st`;
		case 2:
			return `${value}nd`;
		case 3:
			return `${value}rd`;
		default:
			return `${value}th`;
	}
}

function replaceLocalizedTokens(template: string) {
	return template.replace(/LLLL|LLL|LL|L|llll|lll|ll|l/g, (token) => LOCALIZED_FORMAT_MAP[token] ?? token);
}

function formatDate(date: DateTime.DateTime, template: string, isUTC: boolean) {
	const parts = getDateParts(date, isUTC);
	const hour12Raw = parts.hour % 12;
	const hour12 = hour12Raw === 0
		? 12
		: hour12Raw;
	const quarter = Math.ceil(parts.month / 3);

	const tokenMap: Record<string, string> = {
		YYYY: String(parts.year),
		YY: pad(parts.year % 100, 2),
		MMMM: MonthName.Options[parts.month - 1],
		MMM: MonthNameShort.Options[parts.month - 1],
		MM: pad(parts.month, 2),
		M: String(parts.month),
		DD: pad(parts.day, 2),
		D: String(parts.day),
		Do: ordinal(parts.day),
		dddd: WeekDayName.Options[parts.dayOfWeek],
		ddd: WeekDayNameShort.Options[parts.dayOfWeek],
		dd: WeekDayNameMin.Options[parts.dayOfWeek],
		d: String(parts.dayOfWeek),
		HH: pad(parts.hour, 2),
		H: String(parts.hour),
		hh: pad(hour12, 2),
		h: String(hour12),
		mm: pad(parts.minute, 2),
		m: String(parts.minute),
		ss: pad(parts.second, 2),
		s: String(parts.second),
		SSS: pad(parts.millisecond, 3),
		A: parts.hour >= 12
			? 'PM'
			: 'AM',
		a: parts.hour >= 12
			? 'pm'
			: 'am',
		Q: String(quarter),
		Qo: ordinal(quarter),
		X: String(Math.floor(DateTime.toEpochMillis(date) / 1000)),
		x: String(DateTime.toEpochMillis(date)),
		Z: getTimezoneString(date, isUTC, false),
		ZZ: getTimezoneString(date, isUTC, true),
	};

	const escapedBlocks: string[] = [];
	const escaped = template.replace(/\[([^\]]+)]/g, (_, value: string) => {
		const index = escapedBlocks.push(value) - 1;
		return `\u0000${index}\u0000`;
	});

	const localizedExpanded = replaceLocalizedTokens(escaped);
	const replaced = localizedExpanded.replace(
		/YYYY|YY|MMMM|MMM|MM|M|DD|Do|D|dddd|ddd|dd|d|HH|H|hh|h|mm|m|ss|s|SSS|A|a|Qo|Q|X|x|ZZ|Z/g,
		(token) => tokenMap[token] ?? token,
	);

	return replaced.replace(/\u0000(\d+)\u0000/g, (_, indexText: string) => escapedBlocks[Number(indexText)] ?? '');
}

interface DateKitStatic {
	(input?: DateKitInput): DateKit;

	utc: (input?: DateKitInput) => DateKit;
	isDateKit: (value: unknown) => value is DateKit;
	unix: (timestamp: number) => DateKit;
}

function createDateKit(input?: DateKitInput) {
	return DateKit.new(toDateTime(input, false), false);
}

export const dateKit: DateKitStatic = Object.assign(createDateKit, {
	utc: (input?: DateKitInput) => DateKit.new(toDateTime(input, true), true),
	isDateKit: (value: unknown): value is DateKit => S.is(DateKit)(value),
	unix: (timestamp: number) => createDateKit(timestamp * 1000),
});
