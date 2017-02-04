gulp-rev-hash-inline
=============

> Keeps a file's hash in file's links to your assets. For automatic cache updating purpose.

## Install

```
npm install --save-dev gulp-rev-hash-inline
```


## Examples

### Default

This example will keep links to assets in `layouts/_base.ect` ECT template always updated on assets change. If your assets are not in root of your project, add assetsDir option, like this: `.pipe(revHash({assetsDir: 'public'}))`

```js
var gulp = require('gulp');
var revHash = require('gulp-rev-hash-inline');

gulp.task('rev-hash', function () {
	gulp.src('layouts/_base.ect')
		.pipe(revHash())
		.pipe(gulp.dest('layouts'));
});
```

#### Input:

```html
<!-- rev-hash -->
<link rel="stylesheet" href="main.min.css">
<!-- end -->

<!-- rev-hash -->
<script src="abc-v0401f2bda539bac50b0378d799c2b64e.js"></script>
<script src="def-ve478ca95198c5a901c52f7a0f91a5d00.js"></script>
<!-- end -->
```

#### Output:

```html
<!-- rev-hash -->
<link rel="stylesheet" href="main.min-v9d58b7441d92130f545778e418d1317d.css">
<!-- end -->

<!-- rev-hash -->
<script src="abc-v0401f2bda539bac50b0378d799c2b64e.js"></script>
<script src="def-ve478ca95198c5a901c52f7a0f91a5d00.js"></script>
<!-- end -->
```

Main idea is that your template always contains a link with hash. So, if you use preprocessing for your assets (compass, less, stylus, coffeescript, dart), if you accidentally added empty line or empty item to your source, preprocessor will generate the same file and your cached resource will have the same hash. And your clients will not redownload file.

### Custom options

```
assetsDir: 'public'
```

Path to assets in your project

### Known issues

* Assets links in template should be on new line each.
