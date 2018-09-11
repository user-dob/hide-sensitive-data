export class HideSensitiveData {
    constructor(sensitiveDataMap = {}) {
        this.sensitiveDataMap = sensitiveDataMap;
        this._regexp = null;
        this._brackets = new Map();
    }

    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    get regexp() {
        if (this._regexp === null) {
            const keys = Object.keys(this.sensitiveDataMap).map(this.escapeRegExp);
            this._regexp = new RegExp(`${keys.join('|')}`, 'g');
        }
        return this._regexp;
    }

    replace(string, config) {
        const result = [];
        let cursor = 0;

        for (let item of config) {
            result.push(
                string.substring(cursor, item.start),
                item.string
            )
            cursor = item.end
        }

        result.push(
            string.substring(cursor, string.length)
        )

        return result.join('');
    }

    hideValue(key, value) {
        const sensitiveValue = this.sensitiveDataMap[key];

        if (typeof sensitiveValue === 'function') {
            return sensitiveValue(value);
        }

        return sensitiveValue;
    }

    getLeftBracketSize(index, string) {
        let i = index - 1;

        if (string[i] !== '"') {
            return null;
        }

        while (i > 0) {
            i--;

            if (string[i] !== '\\') {
                return index - i - 2;
            }
        }

        return null;
    }

    getBracket(size) {
        if (!this._brackets.has(size)) {
            const bracket = '\\'.repeat(size) + '"';
            this._brackets.set(size, bracket);
        }
        return this._brackets.get(size);
    }

    matchKey(key, index, string) {
        const leftBracketSize = this.getLeftBracketSize(index, string);

        if (leftBracketSize === null) {
            return null;
        }

        const bracket = this.getBracket(leftBracketSize);
        const rightPartStart = index + key.length;
        const rightPartEnd = rightPartStart + 2 * bracket.length + 1;
        const rightPart = string.substring(rightPartStart, rightPartEnd);

        if (rightPart === `${bracket}:${bracket}`) {
            const indexOfBracket = string.substring(rightPartEnd).indexOf(`${bracket}`);
            const valueIndexStart = rightPartEnd;
            const valueIndexEnd = rightPartEnd + indexOfBracket;

            return {
                valueIndexStart,
                valueIndexEnd: valueIndexEnd,
                endIndex: valueIndexEnd + bracket.length,
                value: string.substring(valueIndexStart, valueIndexEnd)
            }
        }
    }

    hide(string) {
        const replaceConfig = [];
        const regexp = this.regexp;
        regexp.lastIndex = 0;

        let match;

        while (match = regexp.exec(string)) {
            const key = match[0];
            const matchKey = this.matchKey(key, match.index, string);

            if (matchKey) {
                replaceConfig.push({
                    start: matchKey.valueIndexStart,
                    end: matchKey.valueIndexEnd,
                    string: this.hideValue(key, matchKey.value)
                });
                regexp.lastIndex = matchKey.endIndex;
            }
        }

        return this.replace(string, replaceConfig);
    }
}