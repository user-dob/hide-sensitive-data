# hide-sensitive-data

This library will help to hide some fields in json string with different depths JSON.stringify

```js
const hideSensitiveData = new HideSensitiveData({
    foo: '**HIDDEN**',
    email: value => value.replace(/([\w.\-+])?[\w.\-+]*([\w.\-+]@[\w.\-+]+)/g, '$1*****$2')
});

const string = JSON.stringify({
    foo: 'foo data',
    x: JSON.stringify({
        foo: 'foo data 2',
        y: JSON.stringify({
            foo: 'foo data 2',
            email: 'test@temp.com'
        }) 
    }),
    email: 'test@temp.com'
});

// {"foo":"foo data","email":"test@temp.com","x":"{\"foo\":\"foo data 2\",\"y\":\"{\\\"foo\\\":\\\"foo data 2\\\",\\\"email\\\":\\\"test@temp.com\\\"}\"}"}

hideSensitiveData.hide(string);

// {"foo":"**HIDDEN**","email":"t*****t@temp.com","x":"{\"foo\":\"**HIDDEN**\",\"y\":\"{\\\"foo\\\":\\\"**HIDDEN**\\\",\\\"email\\\":\\\"t*****t@temp.com\\\"}\"}"}
```