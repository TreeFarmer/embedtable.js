import { EmbedField } from 'discord.js';
import { Row } from './Row.js';
import { TableData, RowOptionData } from '../typings/index.js';

export class Table {
	/**
	 * An array of titles for the Table
	 */
	private readonly titles: string[];

	/**
	 * The starting indexes for each title in the entire title string
	 */
	private readonly titleIndexes: number[];

	/**
	 * The Table's generated rows
	 */
	private readonly rows: string[];

	/**
	 * The starting indexes for each column of data
	 */
	private readonly rowIndexes: number[];

	/**
	 * A string to add to the beginning of every row
	 */
	public readonly start: string;

	/**
	 * A string to add to the end of every row
	 */
	public readonly end: string;

	/**
	 * A pad for the end of each row, before the end
	 * @see [String.prototype.padEnd()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padEnd)
	 */
	public readonly padEnd: number;

	/**
	 * The Table's generated title
	 */
	public readonly titleString: string;

	/**
	 * Whether or not to include the Whitespace character (\u200b) in spacing (not required if using backticks for the start and end)
	 */
	private readonly whiteSpace: boolean;

	/**
	 * Create a new Table
	 * @param {TableData} data 
	 */
	public constructor({ rowIndexes, titleIndexes, titles, end = '', padEnd = 0, start = '', whiteSpace = false }: TableData) {
		this.titleString = '';
		this.titles = titles;
		this.titleIndexes = titleIndexes;
		this.rows = [];
		this.rowIndexes = rowIndexes;
		this.start = start;
		this.end = end;
		this.padEnd = padEnd;
		this.whiteSpace = whiteSpace;

		if (this.titles.length !== this.titleIndexes.length) throw new RangeError('The \'titles\' and \'titleIndex\' array must be of the same length.');

		for (let i = 0; i < this.titles.length; i++) this.titleString += this.padColumnTitle(i);
	}

	/**
	 * Add a row with data to the Table
	 * @param {string[]} columns 
	 * @param {RowOptionData} options
	 * @returns {this}
	 */
	public addRow(columns: string[], options?: RowOptionData): this {
		this.rows.push(this.start + new Row(columns, this.rowIndexes, (this.whiteSpace ?? false), options).toString().padEnd(this.rowIndexes[this.rowIndexes.length - 1]! + (options?.override ?? 0 + this.padEnd), ' ') + this.end);

		return this;
	}

	/**
	 * Convert the Table to an EmbedField object
	 * @param {boolean | undefined} inline Whether or not the field is inline
	 * @returns {EmbedField} Use this when creating a MessageEmbed
	 */
	public field(inline?: boolean): EmbedField {
		const field: EmbedField = {
			name: this.titleString,
			value: this.rows.join('\n'),
			inline: inline ?? false
		};

		this.clear();

		return field;
	}

	/**
	 * Clear the rows out of the Table
	 * @returns {void}
	 */
	private clear(): void {
		this.rows.length = 0;
	}

	/**
	 * Adds the spacing to the titles in the title string
	 * @param {number} i 
	 * @returns {string} The padded title
	 */
	private padColumnTitle(i: number): string {
		if (!this.titlesOkay()) throw new RangeError('Length of a \'title\' cannot be longer than the starting index of the next title. Try increasing the value of the subsequent \'titleIndex\'.');

		return ' '.repeat(this.titleIndexes[i]! - (this.titleIndexes[i - 1] ?? 0) - (this.titles[i - 1]?.length ?? 0)) + this.titles[i]!.slice(0, (this.titleIndexes[i + 1] ?? Infinity) - this.titleIndexes[i]! - 1);
	}

	private titlesOkay(): boolean {
		for (let i = 0; i < this.titles.length - 1; i++)
			if (this.titles[i]!.length > this.titleIndexes[i + 1]!) return false;

		return true;
	}
}