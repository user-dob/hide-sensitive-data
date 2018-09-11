import { expect } from 'chai';
import { HideSensitiveData } from '../src';

describe('HideSensitiveData', () => {

    it ('create regexp with one field', () => {
        const hideSensitiveData = new HideSensitiveData({
            foo: '**HIDDEN**'
        });

        expect(hideSensitiveData.regexp).to.eql(/foo/g);
    })

    it ('create regexp many fields', () => {
        const hideSensitiveData = new HideSensitiveData({
            foo: '**HIDDEN**',
            bar: '**HIDDEN**'
        });

        expect(hideSensitiveData.regexp).to.eql(/foo|bar/g);
    })

    it ('create regexp with escaping fields', () => {
        const hideSensitiveData = new HideSensitiveData({
            '$foo': '**HIDDEN**',
            'bar?': '**HIDDEN**'
        });

        expect(hideSensitiveData.regexp).to.eql(/\$foo|bar\?/g);
    })

    it ('replace', () => {
        const hideSensitiveData = new HideSensitiveData();

        const str = '{"foo":"foo data"}'
        const actualStr = hideSensitiveData.replace(str, [
            {
                start: 8,
                end: 16,
                string: '**HIDDEN**'
            }
        ]);

        const expectedStr = '{"foo":"**HIDDEN**"}'

        expect(actualStr).to.eql(expectedStr);
    })

    it ('hide str field one filed depth=1', () => {
        const hideSensitiveData = new HideSensitiveData({
            foo: '**HIDDEN**'
        });

        const str = JSON.stringify({
            email: 'test',
            foo: 'foo data'
        });

        const expectedStr = JSON.stringify({
            email: 'test',
            foo: '**HIDDEN**'
        });

        const actualStr = hideSensitiveData.hide(str); 

        expect(actualStr).to.equal(expectedStr)
    })

    it ('hide str field two fileds depth=1', () => {
        const hideSensitiveData = new HideSensitiveData({
            foo: '**HIDDEN-FOO**',
            bar: '**HIDDEN-BAR**'
        });

        const str = JSON.stringify({
            foo: 'foo data',
            x: {
                bar: 'bar data'
            }
        });

        const expectedStr = JSON.stringify({
            foo: '**HIDDEN-FOO**',
            x: {
                bar: '**HIDDEN-BAR**'
            }
        });

        const actualStr = hideSensitiveData.hide(str); 

        expect(actualStr).to.equal(expectedStr)
    })

    it ('hide str field one filed depth=3', () => {
        const hideSensitiveData = new HideSensitiveData({
            foo: '**HIDDEN**'
        });

        const str = JSON.stringify({
            foo: 'foo data',
            x: JSON.stringify({
                foo: 'foo data 2',
                y: JSON.stringify({
                    foo: 'foo data 2'
                }) 
            })
        });

        const expectedStr = JSON.stringify({
            foo: '**HIDDEN**',
            x: JSON.stringify({
                foo: '**HIDDEN**',
                y: JSON.stringify({
                    foo: '**HIDDEN**'
                }) 
            })
        });

        const actualStr = hideSensitiveData.hide(str); 

        expect(actualStr).to.equal(expectedStr)
    })

    it ('hide str field with hide pattern', () => {
        const hideSensitiveData = new HideSensitiveData({
            email: value => value.replace(/([\w.\-+])?[\w.\-+]*([\w.\-+]@[\w.\-+]+)/g, '$1*****$2')
        });

        const str = JSON.stringify({
            foo: 'foo data',
            email: 'test@temp.com'
        });

        const expectedStr = JSON.stringify({
            foo: 'foo data',
            email: 't*****t@temp.com'
        });

        const actualStr = hideSensitiveData.hide(str); 

        expect(actualStr).to.equal(expectedStr)
    })

})