# Magneticmediajs ![GitHub Logo](https://www.magneticmediajs.com/images/logo-magneticmediajs-120.png)

How does it look? :arrow_forward: https://www.magneticmediajs.com

Magneticmediajs is a JavaScript and CSS solution to display media content in a stylish mobile-ready overlay fashion. It includes designs for e-commerce, media gallery and also lets you ingest content from today's most popular media platform: Youtube, Instagram, Vimeo, Flickr, Dailymotion. Magneticmediajs is built with a JavaScript pseudo-class model for easier work of extension, jQuery for DOM manipulation and Less CSS3 with progressive enhancement.

## Features

* Display images, Flickr & Instagram content
* Display HTML5 (with Flash fallback), Youtube, Vimeo & Dailymotion videos
* Show locations with Google maps
* Smart display: the viewing area is automatically maximized based on device and content specifications
* Responsive with touch support: from iOS, Android to Desktop & TVs
* API to programmatically control your media
* Global CDN delivery available with jsDelivr. HTTPS & HTTP support
* Magnifying glass: enlarge areas of your images & photos
* 8 filter effects: sepia, grayscale, invert, brightness, contrast, saturate, blur & hue-rotate
* Ecommerce and media gallery mobile-ready designs
* Colorful and easily customizable
* Deeplinking (one item = one URL), social media sharing, error management, multiple instances support
* Keyboard control
* Documentation and JSDoc 3 commented sources


## Install 

#### Include files from jsDelivr CDN 

See Quick start guide below

#### Bower 

`bower install magneticmediajs`

#### GitHub 

Checkout sources or download ZIP package from GitHub

## Documentation

The full documentation is available [here](https://www.magneticmediajs.com/documentation.html).

#### Quick start guide:

* Include jQuery

```<script src="//code.jquery.com/jquery-2.1.1.min.js"></script>```

* Include Magneticmediajs JavaScript file:

```<script src="//cdn.jsdelivr.net/magneticmediajs/1.4.0/js/mjs.min.js"></script>```

* Include Magneticmediajs CSS file:

```<link rel="stylesheet" type="text/css" href="//cdn.jsdelivr.net/magneticmediajs/1.4.0/css/mjs.min.css">```

* Prepare an HTML element, an id or a class to be used with Magneticmediajs

```<div id="itemToDisplay">Check This View</div>```

* Adjust settings

```javascript
var mjsSettings = {
    color1: 'CC011B',
    color2: '080808',
    borderWidth: 4,
    borderRadius: 4,
    background: '080808', 
    backgroundOpacity: 0.8
};
```

* Tell Magneticmediajs which media to display (data array)

```javascript
var mjsData = [
    ['image', 'images/london-horse-guards-parade.jpg']
];
```

* Instantiation + initialization

```javascript
    var mjs = new Magneticmediajs('#itemToDisplay', mjsSettings, mjsData);
    mjs.init();
```
* Done! :bowtie:

## Release History

https://www.magneticmediajs.com/version-history.html

## License Information

Magneticmediajs is an open source project released under MIT License.
https://www.magneticmediajs.com/mit-license.html

## Buy Me A Coffee

You can tip me on [Gratipay](https://gratipay.com/arnaudleyder/) if you like Magneticmediajs.

Copyright (c) 2014-2015 Arnaud Leyder | [Leyder Consulting](https://www.leyder-consulting.com)


> Enjoy Magneticmediajs! 



