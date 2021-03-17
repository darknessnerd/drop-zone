# DropZone

[![Build Status](https://www.travis-ci.com/darknessnerd/drop-zone.svg?branch=main)](https://www.travis-ci.com/darknessnerd/drop-zone)
![NPM Downloads](https://img.shields.io/npm/dw/drop-zone)
![Snyk Vulnerabilities for npm package](https://img.shields.io/snyk/vulnerabilities/npm/drop-zone)
![NPM License](https://img.shields.io/npm/l/drop-zone)
![NPM Version](https://img.shields.io/npm/v/drop-zone)
![npm collaborators](https://img.shields.io/npm/collaborators/drop-zone)

:bomb:<br>
[Features Live Demo Link: Click here !! ](https://darknessnerd.github.io/drop-box/index.html)

> Vue3 Library Component for drag’n’drop file uploads with image previews.

### :rocket: Features

* No dependencies
* Drag and drop file uploads 
* Custom accepted file types
* XHR custom: Header, url, method and form data.
* Parallel upload with different request 
* Multiple upload files in a single request  
* Chunking 
* Custom styling
* Events 
* Provide your own markup for drop, error and success message

## Install and basic usage

```bash
$ npm install --save drop-zone
```
Register the component

```js
import DropZone from 'drop-zone';

// optionally import default styles
import 'drop-zone/dist/drop-zone.common.css';

createApp(App)
  .use(DropZone)
  .mount('#app');
```

Now your component inside a code:

```vue
<template>
  <div style="height: 500px; width: 500px; border: 1px solid red; position: relative;">
    <DropZone 
        :maxFiles="Number(10000000000)"
        url="http://localhost:5000/item"
        :uploadOnDrop="true"
        :multipleUpload="true"
        :parallelUpload="3"/>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { DropZone } from 'drop-zone';

export default defineComponent({
  components: {
    DropZone,
  },
  name: 'App',
  setup() {
    return {
    };
  },
});
</script>

```


### Props

#### url
Type: `String`<br>
Required: `false`<br>
Default: `window.localtion`

Upload url

```html
<Dropzone url="http://endpoint/upload">
```

#### method
Type: `String`<br>
Required: `false`<br>
Default: `POST`

Upload method can be POST or PUT 

```html
<Dropzone method="PUT">
```

#### headers
Type: `Object`<br>
Required: `false`<br>
Default: `{}`

Send additional headers to the server.

```html
<Dropzone :headers="{"header1": "value"}">
```
#### paramName
Type: `String`<br>
Required: `false`<br>
Default: `file`

Formdata key for file upload request 

```html
<Dropzone paramName="test">
```

#### xhrTimeout
Type: `number`<br>
Required: `false`<br>
Default: `60000`

The timeout for the XHR requests in milliseconds

```html
<Dropzone :xhrTimeout="Number(500)">
```

#### withCredentials
Type: `boolean`<br>
Required: `false`<br>
Default: `false`

withCredentials option for XHR requests 

```html
<Dropzone :xhrTimeout="Number(500)">
```
#### uploadOnDrop
Type: `boolean`<br>
Required: `false`<br>
Default: `true`

Process the upload automatically on drop or on file selection
if it's set to true

```html
<Dropzone :uploadOnDrop="true">
```

if it's set to false, the upload can be triggered with: 
```html
<Dropzone ref="dropzone" :uploadOnDrop="true">
```

```js
dropzone.value.processQueue();
```

#### retryOnError
Type: `boolean`<br>
Required: `false`<br>
Default: `false`

Retry an upload if it fail.

```html
<Dropzone :retryOnError="true">
```

#### multipleUpload
Type: `boolean`<br>
Required: `false`<br>
Default: `false`

Send more items in one request, this is disabled in case of the prop chunking is true.

```html
<Dropzone :multipleUpload="true">
```

#### parallelUpload
Type: `number`<br>
Required: `false`<br>
Default: `3`

Parallel request  upload to be processed

```html
<Dropzone :parallelUpload="6">
```

#### maxFiles
Type: `number`<br>
Required: `false`<br>
Default: `null`

Max files number accepted by the Dropzone, if it not set 
there is no limit.

```html
<Dropzone :maxFiles="6">
```

#### maxFileSize
Type: `number`<br>
Required: `false`<br>
Default: `1000000`

Bytes value for the max upload size allowed, default 1mb

```html
<Dropzone :maxFiles="600000000">
```

#### hiddenInputContainer
Type: `string | Element`<br>
Required: `false`<br>
Default: `body`

Element or query selector where the hidden Input it's placed

```html
<Dropzone :hiddenInputContainer="div">
```

#### clickable
Type: `boolean`<br>
Required: `false`<br>
Default: `true`

If active enable the dropzone to be clickable and show the files selection
```html
<Dropzone :clickable="false">
```

#### acceptedFiles
Type: `array`<br>
Required: `false`<br>
Default: `null`

Array that contain the accepted files, possible values:
 ['image', 'doc', 'video', 'png', ... , 'audio' ]
 
```html
<Dropzone :acceptedFiles="['exe']">
```
#### chunking
Type: `boolean`<br>
Required: `false`<br>
Default: `false`

Enable the upload chunking feature, 
if this is active the multipleUpload for request will be set to false.

```html
<Dropzone :chunking="true">
```

#### numberOfChunks
Type: `number`<br>
Required: `false`<br>
Default: `10`

If the chunking mode is active this property represents the number of
chunks with which the file will be split

```html
<Dropzone :numberOfChunks="5">
```

#### dropzoneClassName
Type: `string`<br>
Required: `false`<br>
Default: `dropzone__box`

custom class for the dropzone 

```html
<Dropzone :dropzoneClassName="customClass">
```
#### dropzoneMessageClassName
Type: `string`<br>
Required: `false`<br>
Default: `dropzone__message--style`

custom class for the dropzone  message

```html
<Dropzone :dropzoneMessageClassName="customClass">
```

#### dropzoneItemClassName
Type: `string`<br>
Required: `false`<br>
Default: `dropzone__item--style`

custom class for the dropzone  item

```html
<Dropzone :dropzoneItemClassName="customClass">
```
#### dropzoneDetailsClassName
Type: `string`<br>
Required: `false`<br>
Default: `dropzone__details--style`

custom class for the dropzone details

```html
<Dropzone :dropzoneDetailsClassName="customClass">
```




### Events

#### config-update

Parameters:
* `config` config object with the new values 

Called when a props is changed

```html
<DropZone @configUpdate="onUpdateConfig">
```


#### added-file

Parameters:
* `item` {id: 'fileid', file: File} 

Called when a file is valid ( type and size ) and added to the queue.

```html
<DropZone @addedFile="onFileAdd">
```
#### removed-file

Parameters:
* `item` {id: 'fileid', status: "DONE|ERROR|QUEUE",  file: File} 

Called when a file is removed.

```html
<DropZone @removedFile="onFileRemove">
```
#### uploaded

Parameters:
* `items` [{file: File}]

Called when a file or files are uploaded.

```html
<DropZone @removedFile="onFileRemove">
```

#### error-upload

Parameters:
* `error` {ids: Array(['fileid']), errorType: "error type"}

Called when a file or files uploads fail.

```html
<DropZone @errorUpload="onErrorUpload">
```



#### sending

Parameters:
* `files` Array(File)
* `xhr` XMLHttpRequest
* `formData` FormData

Called when a file is going to be uploaded.

```html
<DropZone @errorUpload="onErrorUpload">
```
