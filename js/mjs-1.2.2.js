/* Magneticmediajs 1.2.2 | Copyright (c) 2014 Arnaud Leyder at Leyder Consulting https://www.leyder-consulting.com/
License information available at https://www.magneticmediajs.com/terms-of-service.html
For contact information please visit https://www.magneticmediajs.com
*/

/**** Global object for state variables ****/
var mjsGlobal = {
    itemOnStage: false,
    itemType: '',
    itemName: '',
    mapCallback: function() {},
    mapInstance: {},
    borderWidth: {},
    borderRadius: {},
    videoWidth: {},
    videoHeight: {},
    loadError: 0,
    locationProtocol: '',
    hasTouchMove: false,
    hasSwipe: false,
    hasSwipeLeft: false,
    hasSwipeRight: false,
    startX: 0,
    startY: 0,
    timeSpacer: false
};

/**** Magneticmediajs class definition ****/
var Magneticmediajs = (function() {

    /** constructor **/
    function Magneticmediajs(elements, settings, data) {
        this.elements = this.getElements(elements);
        this._defaults = {

            color1: '080808',
            color2: 'fdfdfd',
            borderWidth: 8,
            borderRadius: 8,
            background: '000000',
            backgroundOpacity: 0.7,
            displayTitle: false,
            videoWidth: 640,
            videoHeight: 360,
            autoPlayVideo: false,
            zoomOn: false,
            zoomLevel: 2,
            zoomType: 'default',
            zoomSize: 200,
            sharing: false,
            facebookID: 261636627358702,
            gallery: false,
            ecommerce: false,
            showIcons:true,
            galleryMaxThumbnailHeight: 150,
			thumbnailPadding: 0,
			thumbnailBorderWidth: 0,
			thumbnailBorderRadius: 0,
			thumbnailBorderColor: 'BBB',
			filter: 'none',
            onMjsMediaOnStage: function(){},
            onMjsMediaOffStage: function(){}
        };
        this.settings = settings;
        this.data = data;
    }

    /** private methods **/
    // get location protocol
    var _mjsGetLocationProtocol = function () {
        var protocol = window.location.protocol;
        if (typeof protocol === 'undefined') {
            mjsGlobal['locationProtocol'] = 'https:';
        } else if (protocol === 'http:') {
            mjsGlobal['locationProtocol'] = protocol;
        } else {
            mjsGlobal['locationProtocol'] = 'https:';
        }
    };
    
    // function to check for HTML5 video support
    var _mjsSupportsVideo = function() {
        return !!document.createElement('video').canPlayType;
    };
    
    // function to check for MP4/H264 decoding support
    var _mjsSupportsMp4 = function() {
        var supports = false;
        if (_mjsSupportsVideo()) {
            var tempVideo = document.createElement('video');
            var videoCanPlay = tempVideo.canPlayType('video/mp4');
            if (videoCanPlay !== "") {
                supports = true;
            }
        }
        return supports;
    };
    
    // function to check if device is an iPod or an iPhone
    var _mjsIsIos = function() {
        var iOS = navigator.userAgent.toLowerCase().match(/(iphone|ipod|ipad)/g) ? true : false ;
        return iOS;
    };
    
    // function to get RGB color code based on hex code
    var _mjsHexToRgb = function(hex) {
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
            return r + r + g + g + b + b;
        });
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };
    
    // function to make the fullscreen overlay content responsive
    var _mjsMakeItFit = function(width,height,widthViewport,heightViewport,borderWidth,borderRadius,contentType) {
        var ratio = width/height;
        if (widthViewport < 768) {
            var borderWidth = borderWidth/2.5;
            var borderRadius = borderRadius/2.5;
            var widthLimit = Math.floor(75*widthViewport/100);
            var heightLimit = Math.floor(75*heightViewport/100);
        } else if (widthViewport >= 768 && widthViewport < 1024) {
            var borderWidth = borderWidth/1.5;
            var borderRadius = borderRadius/1.5;
            var widthLimit = Math.floor(80*widthViewport/100);
            var heightLimit = Math.floor(80*heightViewport/100);
        } else {
            var borderWidth = borderWidth;
            var borderRadius = borderRadius;
            var widthLimit = Math.floor(82*widthViewport/100);
            var heightLimit = Math.floor(82*heightViewport/100);
        }
        if ((width > widthLimit) && (height > heightLimit)) {
            var width = widthLimit;
            var height = Math.floor(width/ratio);
            if (height > heightLimit) {
                height = heightLimit;
                width = Math.floor(height*ratio);
            }
        } else if (width > widthLimit) {
            var width = widthLimit;
            var height = Math.floor(width/ratio);
            if (contentType === 'maps') {
                if (height < heightLimit) {
                    height = heightLimit;
                }
            }
        } else if (height > heightLimit) {
            var height = heightLimit;
            var width = Math.floor(height*ratio);
            if (contentType === 'maps') {
                if (width < widthLimit) {
                    width = widthLimit;
                }
            }
        } else {
            var width = widthLimit;
            var height = Math.floor(width/ratio);
            if (height > heightLimit) {
                height = heightLimit;
                width = Math.floor(height*ratio);
            }
        }
        var result = [];
        result[0] = width;
        result[1] = height;
        result[2] = borderWidth;
        result[3] = borderRadius;
        return result;
    };
    
    // set which item is on stage
    var _mjsSetItemOn = function(dataType) {
        mjsGlobal['itemOnStage'] = true;
        mjsGlobal['itemName'] = dataType;
        if (dataType === 'image' || dataType === 'flickr' || dataType === 'instagram') {
            mjsGlobal['itemType'] = 'image';
        } else if(dataType === 'video' || dataType === 'youtube' || dataType === 'vimeo' || dataType === 'dailymotion') {
            mjsGlobal['itemType'] = 'video';
        } else if(dataType === 'maps') {
            mjsGlobal['itemType'] = 'maps';
        }
    };
    
    // unsetset item on stage
    var _mjsUnsetItemOn = function() {
        mjsGlobal['itemOnStage'] = false;
        mjsGlobal['itemName'] = '';
        mjsGlobal['itemType'] = '';
        mjsGlobal['mapInstance']  = null;
    };
    
    // required for iOS correct heightViewport
    var _mjsGetAccurateHeight = function() {
        if (_mjsIsIos()) {
            var heightViewport = window.innerHeight;
        } else {
            var heightViewport = $(window).height();
        }
        return heightViewport;
    };
    
    // function to add round border support when borderWidth is set to 0
    var _adjustRoundBorder = function (borderWidth, borderRadius) {
        if (borderWidth === 0 && borderRadius > 0) {
            $('.mjs-fs-wrapper > img').css('border-radius',(borderRadius)+'px');
            $('.mjs-fs-wrapper > video').css('border-radius',(borderRadius)+'px');
        }
    };
    
    // function to load image/photo content as the main overlay item
    var _mjsLoadImage = function(src, zoomOn, zoomLevel, zoomType, zoomSize, displayTitle, mjsTitle, color1, color2 ,borderWidth ,borderRadius ,multiple, filter) {
        var voWidthViewport = $(window).width();
        var voHeightViewport = _mjsGetAccurateHeight();
        var newImage = new Image();
        newImage.id = 'mjs-img-full';
        $(newImage).appendTo('.mjs-fs-wrapper');
        $(newImage).on('load', function() {
            var newSize = _mjsGetNaturalSize(newImage);
            var width = newSize[0];
            var height = newSize[1];
            var result = _mjsMakeItFit(width,height,voWidthViewport,voHeightViewport,borderWidth,borderRadius,'picture');
            width = result[0];
            height = result[1];
            var tempBorderWidth = result[2];
            var tempBorderRadius = result[3];
            $('.mjs-fs-wrapper').css({'width':width+'px','height':height+'px','max-width':'','max-height':''}).fadeIn(300);
            if (zoomOn) {
                _mjsRunZoomProcess(newImage.src,zoomLevel,zoomType,zoomSize);
            }
            if (displayTitle && mjsTitle !== '') {
                $('.mjs-fs-wrapper').append('<div class="mjs-title-area">'+mjsTitle+'</div>');
                $('.mjs-fs-wrapper').css({'margin-top':'-15px'});
            }
            _mjsColorIt(color1, color2, tempBorderWidth, tempBorderRadius);
			if (filter !== 'none') {
				$('.mjs-fs-wrapper > img').addClass('mjs-'+filter);
			}
            $('.mjs-parent-spin').removeClass('mjs-do-spin');
            $('.mjs-parent-spin').hide();
            _adjustRoundBorder(tempBorderWidth, tempBorderRadius);
            $(document).trigger('mjsMediaOnStage');
        });
        $(newImage).on('error', function() {
            $('.mjs-fullscreen').remove();
            $('.mjs-parent-spin').removeClass('mjs-do-spin');
            $('.mjs-parent-spin').hide();
            alert('An error occurred while loading this content. Please try again later.');
        });
        newImage.src = src;
    };

    // functions to load Google Maps content as the main overlay item
    var _mjsInitializeMaps = function(lat, lng, zoom, title, description) {
        var thisLatlng = new google.maps.LatLng(lat, lng)
        var mapOptions = {
            zoom: zoom,
            center: thisLatlng
        };
        mjsGlobal['mapInstance'] = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
        var contentString = description;
        var infowindow = new google.maps.InfoWindow({
            content: contentString,
            maxWidth: 300
        });
        var marker = new google.maps.Marker({
            position: thisLatlng,
            map: mjsGlobal['mapInstance'],
            animation: google.maps.Animation.DROP,
            title: title
        });
        google.maps.event.addListener(marker, 'click', function() {
            infowindow.open(mjsGlobal['mapInstance'],marker);
         });
    };
    var _mjsLoadMapsScript = function(key) {
        $('#mjsMaps').next().remove();
        $('#mjsMaps').remove();
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.id = 'mjsMaps';
        window.mapCallback = mjsGlobal['mapCallback'];
        if (key !== '') {
            script.src = mjsGlobal['locationProtocol']+'//maps.googleapis.com/maps/api/js?key='+key+'&v=3.exp&' + 'callback=window.mapCallback';
        } else {
              script.src = mjsGlobal['locationProtocol']+'//maps.googleapis.com/maps/api/js?v=3.exp&' + 'callback=window.mapCallback';
        }
        document.body.appendChild(script);
    };
    var _mjsLoadMaps = function(color1, color2, borderWidth, borderRadius, key, lat, lng, zoom, title, description, multiple) {
        var voWidthViewport = $(window).width();
        var voHeightViewport = _mjsGetAccurateHeight();
        $('.mjs-fullscreen').css({'width':voWidthViewport+'px','height':voHeightViewport+'px'});
        var content = '<div id="map-canvas" class="map-area"></div>';
        $(content).appendTo('.mjs-fs-wrapper');
        mjsGlobal['mapCallback'] = function() {
            _mjsInitializeMaps(lat,lng,zoom,title,description);
        };
        _mjsLoadMapsScript(key);
        var width = voWidthViewport;
        var height = voHeightViewport;
        var result = _mjsMakeItFit(width, height, voWidthViewport, voHeightViewport, borderWidth, borderRadius, 'maps');
        var width = result[0];
        var height = result[1];
        var tempBorderWidth = result[2];
        var tempBorderRadius = result[3];
        $('.mjs-fs-wrapper').css({'width':width+'px','height':height+'px','max-width':'','max-height':'','background':'#FFFFFF','color':'#000000'}).fadeIn(300);    
        _mjsColorIt(color1, color2, tempBorderWidth, tempBorderRadius);
        $('.mjs-parent-spin').removeClass('mjs-do-spin');
        $('.mjs-parent-spin').hide();
        $(document).trigger('mjsMediaOnStage');
    };

    // function to load video content as the main overlay item
    var _mjsLoadVideo = function(type, src, videoWidth, videoHeight, autoPlayVideo, displayTitle, mjsTitle, color1, color2, borderWidth, borderRadius, multiple, poster) {
        var voWidthViewport = $(window).width();
        var voHeightViewport = _mjsGetAccurateHeight();
        if (src === 'mjsSingleItem') {
            src = poster;
            poster = '';
        }
        var displayAutoPlay;
        if(autoPlayVideo){
            displayAutoPlay = 1;
        } else {
            displayAutoPlay = 0;
        }
        if (type.indexOf('youtube') > -1) {
            var videoPlayer = '<div class="mjs-video-player"><iframe src="'+mjsGlobal['locationProtocol']+'//www.youtube.com/embed/'+src+'?autoplay='+displayAutoPlay+'" frameborder="0" allowfullscreen></iframe></div>';
        } else if (type.indexOf('vimeo') > -1) {
               var videoPlayer = '<div class="mjs-video-player"><iframe src="'+mjsGlobal['locationProtocol']+'//player.vimeo.com/video/'+src+'?autoplay='+displayAutoPlay+'" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div>';
        } else if (type.indexOf('dailymotion') > -1) {
            var videoPlayer = '<div class="mjs-video-player"><iframe src="'+mjsGlobal['locationProtocol']+'//www.dailymotion.com/embed/video/'+src+'?autoplay='+displayAutoPlay+'" frameborder="0"></iframe></div>';
        } else {
            var posterFrame = src;
            var videoSource = poster;
            if (poster === '') {
                videoSource = posterFrame;
                posterFrame= '';
            }
            if (_mjsSupportsMp4()) {
                if (autoPlayVideo) {
                    displayAutoPlay = 'autoplay';
                } else {
                    displayAutoPlay='';
                }
                var videoPlayer = '<video controls poster="'+posterFrame+'" src="'+videoSource+'" class="mjs-video-player" '+displayAutoPlay+' preload="auto"></video>';
            } else {
                var startingBitratePathF = videoSource;
                var posterF = posterFrame;
                if (startingBitratePathF.substring(0, 5) !== 'http:' && startingBitratePathF.substring(0, 5) !== 'https:') {
                    startingBitratePathF = '../'+startingBitratePathF;
                }
                if (typeof swfobject !== 'undefined' && swfobject.hasFlashPlayerVersion("10")) {
                    posterF = encodeURIComponent(posterF);
                    startingBitratePathF = encodeURIComponent(startingBitratePathF);
                    var videoPlayer = '<div class="mjs-video-player"><object width="100%" height="100%"><param name="movie" value="flash/StrobeMediaPlayback.swf"></param><param name="flashvars" value="src='+startingBitratePathF+'&poster='+posterF+'&controlBarAutoHide=true&autoPlay='+autoPlayVideo+'"></param><param name="allowFullScreen" value="true"></param><param name="allowscriptaccess" value="always"></param><param name="wmode" value="transparent"></param><embed width="100%" height="100%" src="flash/StrobeMediaPlayback.swf" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" wmode="transparent" flashvars="src='+startingBitratePathF+'&poster='+posterF+'&controlBarAutoHide=true&autoPlay='+autoPlayVideo+'"></embed></object>';
                }
            }
        }
        var result = _mjsMakeItFit(videoWidth, videoHeight, voWidthViewport, voHeightViewport, borderWidth, borderRadius, 'video');
        width = result[0];
        height = result[1];
        var tempBorderWidth = result[2];
        var tempBorderRadius = result[3];
        $('.mjs-fs-wrapper').append(videoPlayer);
        $('.mjs-fs-wrapper,.mjs-video-player').css({'width':width+'px', 'height':height+'px', 'max-width':videoWidth+'px', 'max-height':videoHeight+'px'}).fadeIn(300);
        var iFrameWidth = 0;
        var iFrameHeight = 0;
        if (width > videoWidth) {
            iFrameWidth = videoWidth;
        } else {
            iFrameWidth = width;
        }
        if (height > videoHeight) {
            iFrameHeight = videoHeight;
        } else {
            iFrameHeight = height;
        }
        $('.mjs-video-player > iframe').css({'width':iFrameWidth+'px', 'height':iFrameHeight+'px'});    
        if (displayTitle && mjsTitle !== '') {
            $('.mjs-fs-wrapper').append('<div class="mjs-title-area">'+mjsTitle+'</div>');
            $('.mjs-fs-wrapper').css({'margin-top':'-15px'});
        }
        _mjsColorIt(color1, color2, tempBorderWidth, tempBorderRadius);
        $('.mjs-parent-spin').removeClass('mjs-do-spin');
        $('.mjs-parent-spin').hide();
        _adjustRoundBorder(tempBorderWidth, tempBorderRadius);
        $(document).trigger('mjsMediaOnStage');
    };
    
    // function to get Youtube thumbnail
    var _getYTThumbnail = function (videoId, thumbnailSize, i) {
        var ytThumbQ = 'mqdefault';
        if (thumbnailSize === 'small') {    
            ytThumbQ = 'default';
        } else if (thumbnailSize === 'medium') {
            ytThumbQ = 'mqdefault';
        } else if (thumbnailSize === 'large') {
            ytThumbQ = 'hqdefault';
        }
        var src =  mjsGlobal['locationProtocol']+'//img.youtube.com/vi/'+videoId+'/'+ytThumbQ+'.jpg';
        $('#mjsThumb'+i).prop('src', src);
    };
        
    // function to get Vimeo thumbnail
    var _getVimeoThumbnail = function (videoId, thumbnailSize, i) {
        $.ajax({
            url : 'https://www.vimeo.com/api/v2/video/' + videoId + '.json?callback=?',
            dataType : "jsonp",
            timeout : 5000
        }).done(function(dataRes) {
            var thumbnailSrc ='';
                if (thumbnailSize === 'small') {
                    thumbnailSrc = dataRes[0].thumbnail_small;
                    if (thumbnailSrc.indexOf('http:') > -1 && mjsGlobal['locationProtocol'] === 'https:') {
                        thumbnailSrc = thumbnailSrc.replace('http:', mjsGlobal['locationProtocol']); 
                    }
                    $('#mjsThumb'+i).prop('src',thumbnailSrc);   
                } else if (thumbnailSize === 'medium') {
                    thumbnailSrc = dataRes[0].thumbnail_medium;
                    if (thumbnailSrc.indexOf('http:') > -1 && mjsGlobal['locationProtocol'] === 'https:') {
                        thumbnailSrc = thumbnailSrc.replace('http:', mjsGlobal['locationProtocol']); 
                    }
                    $('#mjsThumb'+i).prop('src',thumbnailSrc);
                    
                } else {
                    thumbnailSrc = dataRes[0].thumbnail_large;
                    if (thumbnailSrc.indexOf('http:') > -1 && mjsGlobal['locationProtocol'] === 'https:') {
                        thumbnailSrc = thumbnailSrc.replace('http:', mjsGlobal['locationProtocol']);
                    }
                    $('#mjsThumb'+i).prop('src',thumbnailSrc);
                }
        }).fail(function() {
            $('#mjsThumb'+i).parent().remove();
            mjsGlobal['loadError'] = mjsGlobal['loadError']+1;
        });
    };

    // function to get Dailymotion thumbnail
    var _getDMThumbnail = function (videoId, thumbnailSize, i) {
        var tbOut = '360';
        if (thumbnailSize  === 'small') {
            tbOut = '180';
        } else if(thumbnailSize  === 'medium') {
            tbOut = '360';
        } else if(thumbnailSize  === 'large') {
            tbOut = '720';
        }
        $.getJSON('https://api.dailymotion.com/video/' + videoId + '?fields=thumbnail_'+tbOut+'_url', function(dataRes) {
            var src = dataRes['thumbnail_'+tbOut+'_url']
            $('#mjsThumb'+i).prop('src',src);
           
        }).fail(function() {
            $('#mjsThumb'+i).parent().remove();
            mjsGlobal['loadError'] = mjsGlobal['loadError']+1;
        });
    };
    
    // function to get storage size of images
    var _mjsGetNaturalSize = function(img) {
        var trueSize = new Array() 
        if (img.naturalWidth) {
            trueSize[0] = img.naturalWidth;
            trueSize[1] = img.naturalHeight;
        } else {
            var testImage = new Image();
            testImage.src = img.src;
            $(newImage).on('load', function() {
                trueSize[0] = this.width;
                trueSize[1] = this.height;
            });
        }
        return trueSize;
    };
    
    // function to get Flickr content    
    var _mjsGetFlickrStream = function (user_id, title, i, type, zoomOn, zoomLevel, zoomType, zoomSize, displayTitle, mjsTitle, color1, color2, borderWidth, borderRadius, multiple, filter) {
        var url = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=3b109ff5810e4d81b73292507ca19928&text='+title+'&safe_search=1&per_page=10&user_id='+user_id;
        var src, srcThumb;
        $.ajax({
            url : url + '&format=json&jsoncallback=?',
            dataType : "jsonp",
            timeout : 5000
        }).done(function(data) {
            if (typeof data.photos !== 'undefined' && data.photos.total > 0) {
                $.each(data.photos.photo, function(k,item) {
                    if (type === 'thumbnail') {
                        srcThumb = mjsGlobal['locationProtocol']+"//farm"+ item.farm +".static.flickr.com/"+ item.server +"/"+ item.id +"_"+ item.secret +"_n.jpg";
                        $('#mjsThumb'+i).prop('src',srcThumb);
                    } else {
                        src = mjsGlobal['locationProtocol']+"//farm"+ item.farm +".static.flickr.com/"+ item.server +"/"+ item.id +"_"+ item.secret +"_b.jpg";
                        _mjsLoadImage(src,zoomOn,zoomLevel,zoomType,zoomSize,displayTitle,mjsTitle,color1,color2,borderWidth,borderRadius,multiple,filter);
                    }
                });
            } else {
                if (type === 'thumbnail') {
                    $('#mjsThumb'+i).parent().remove();
                    mjsGlobal['loadError'] = mjsGlobal['loadError']+1;
                } else {
                    $('.mjs-fullscreen').remove();
                    $('.mjs-parent-spin').removeClass('mjs-do-spin');
                    $('.mjs-parent-spin').hide();
                    alert('An error occurred while loading this content. Please try again later.');
                }    
            }
        }).fail(function() {
            if (type === 'thumbnail') {
                $('#mjsThumb'+i).parent().remove();
                mjsGlobal['loadError'] = mjsGlobal['loadError']+1;
            } else {
                $('.mjs-fullscreen').remove();
                $('.mjs-parent-spin').removeClass('mjs-do-spin');
                $('.mjs-parent-spin').hide();
                alert('An error occurred while loading this content. Please try again later.');
            }
        });
    };
    
    // function to get X coordinate of touch event
    var _mjsGetPosX = function(e, mjsIsTouch) {
        if (!mjsIsTouch) {
            var posx = 0;
            if (!e) var e = window.event;
            if (e.pageX) {
                posx = e.pageX;
            } else if (e.clientX) {
                posx = e.clientX;
            }
        } else {
            posx = e.originalEvent.touches[0].pageX;
        }
        return posx;
    };
    
    // function to get Y coordinate of touch event
    var _mjsGetPosY = function(e, mjsIsTouch) {
        if (!mjsIsTouch) {
            var posy = 0;
            if (!e) var e = window.event;
            if (e.pageY) {
                posy = e.pageY;
            } else if (e.clientX) {
                posy = e.clientY;
            }
        } else {
            posy = e.originalEvent.touches[0].pageY;
        }
        return posy;
    };
    
    // functions to show magnifying glass
    var _mjsShowZoom = function (e, mjsIsTouch, widthWrapper, heightWrapper, leftWrapper, topWrapper, zoomLevel, zoomSize) {
        var posX = _mjsGetPosX(e,mjsIsTouch);
        var posY = _mjsGetPosY(e,mjsIsTouch);
        var setLeft = 0;
        var setTop = 0;
        if (posX < leftWrapper+(zoomSize/4)) {
            setLeft = -(zoomSize/4);
        } else if (posX >= (widthWrapper + leftWrapper - (zoomSize/4))) {
            setLeft = widthWrapper - (zoomSize*3/4);
        } else {
            setLeft = posX - (zoomSize/2) - leftWrapper;
        }
        if (posY < topWrapper+(zoomSize/4)) {
            setTop = -(zoomSize/4);
        } else if (posY >= (heightWrapper + topWrapper - (zoomSize/4))) {
            setTop = heightWrapper - (zoomSize*3/4);
        } else {
            setTop = posY - (zoomSize/2) - topWrapper;
        }
        bgX = (setLeft*zoomLevel) + (zoomSize/2);
        bgY = (setTop*zoomLevel) + (zoomSize/2);
        if (bgY < 0) {
            bgY = 0;
        }
        if (bgX < 0) {
            bgX = 0;
        }
        $('#mjs-zoom-box').css({'background-position':'-'+bgX+'px -'+bgY+'px', 'left':''+setLeft+'px', 'top':''+setTop+'px'});
        $('#mjs-zoom-box').css({'background-size':''+(widthWrapper*zoomLevel)+'px '+(heightWrapper*zoomLevel)+'px'});
    };
    var _mjsZoomSubProcess = function(e) {
        e.stopPropagation();
        e.preventDefault();
        if (e.target.id !== 'mjs-fs-wrapper') {
            $('.mjs-fs-wrapper').trigger('mouseleave');
        }
    };
    var _mjsRunZoomProcess = function(src, zoomLevel, zoomType, zoomSize){
        var mjsZoomOnScreen = false;
        var widthWrapper = $('.mjs-fs-wrapper').width();
        var heightWrapper = $('.mjs-fs-wrapper').height();
        var leftWrapper = $('.mjs-fs-wrapper').offset().left;
        var topWrapper = $('.mjs-fs-wrapper').offset().top;
        var mjsIsTouch = false;
        $(document).on('touchstart',_mjsZoomSubProcess);
        $('.mjs-fs-wrapper').on('mouseleave',function() {
            $('#mjs-zoom-box').fadeOut('fast',function() {
                $(this).remove();
                mjsZoomOnScreen = false;
            });
        });
        $('.mjs-fs-wrapper').on('touchstart',function(event) {
            event.stopPropagation();
            event.preventDefault();
            mjsIsTouch = true;
            var thisEvent = event;
            $(this).trigger('mouseenter',[thisEvent]);
        });
        $('.mjs-fs-wrapper').on('mouseenter',function(event, thisEvent) {
            if (!mjsZoomOnScreen) {
                $('<div id="mjs-zoom-box"></div>').hide().appendTo($(this));
                $('#mjs-zoom-box').css({'background-image':'url("'+src+'")'});
                $('#mjs-zoom-box').fadeIn('fast');
                mjsZoomOnScreen = true;
                var currentViewportWidth = $(window).width();
                var zoomSizeTemp = zoomSize;
                if (currentViewportWidth < 480) {
                    zoomSizeTemp = 100;
                } else if(currentViewportWidth < 768) {
                    zoomSizeTemp = zoomSizeTemp/1.4;
                }
                if (zoomSizeTemp<100) {
                    zoomSizeTemp=100;
                } else if(zoomSizeTemp>300) {
                    zoomSizeTemp=300;
                }
                $('#mjs-zoom-box').width(zoomSizeTemp);
                $('#mjs-zoom-box').height(zoomSizeTemp);
                if (zoomType === 'lens') {
                    $('#mjs-zoom-box').css({'border-radius': '50%','-webkit-box-shadow':'inset 0px 0px 2px 2px #000, 0 0 0 8px #0a0a0a, 0 0 0 9px #EEE, 0px 0px 2px 10px #000','box-shadow':'inset 0px 0px 2px 2px #000, 0 0 0 8px #0a0a0a, 0 0 0 9px #EEE, 0px 0px 2px 10px #000'}); 
                } else {
                    $('#mjs-zoom-box').css({'border-radius': '1px','border':'none','-webkit-box-shadow':'0px 0px 3px 1px #000','box-shadow':'0px 0px 3px 1px #000'}); 
                }
                if (!mjsIsTouch) {
                    var thisEvent = event;
                }
                _mjsShowZoom(thisEvent, mjsIsTouch, widthWrapper, heightWrapper, leftWrapper, topWrapper, zoomLevel, zoomSizeTemp);
            } else {
                if (!mjsIsTouch) {
                    var thisEvent = event;
                }
                if (thisEvent.target.id !== 'mjs-zoom-box') {
                    $('.mjs-fs-wrapper').trigger('mouseleave');
                }
            }
            $('.mjs-fs-wrapper').on('mousemove touchmove',function(event){
                _mjsShowZoom(event, mjsIsTouch, widthWrapper, heightWrapper, leftWrapper, topWrapper, zoomLevel, zoomSizeTemp);
            });    
        });
    };    

    // color icons and wrappers
    var _mjsColorIt = function(color1, color2, borderWidth, borderRadius) {
        if (color1 === color2) {
            var c1 = color1;
            var c2 = '000';
        } else {
            var c1 = color1;
            var c2 = color2;
        }
        $('.mjs-fs-wrapper').css({'border-radius':borderRadius+'px'});
        if ($('.mjs-fs-wrapper').find('img#mjs-img-full').length > 0) {
            $('.mjs-fs-wrapper > img#mjs-img-full').css({'border':borderWidth+'px solid #'+color1, 'border-radius':borderRadius+'px'});
        } else if($('.mjs-fs-wrapper').find('.map-area').length > 0) {
            $('.mjs-fs-wrapper > .map-area').css({'border':borderWidth+'px solid #'+color1, 'border-radius':borderRadius+'px'});
        } else if ($('.mjs-fs-wrapper').find('video.mjs-video-player').length > 0) {
            $('.mjs-fs-wrapper > video.mjs-video-player').css({'border':borderWidth+'px solid #'+color1, 'border-radius':borderRadius+'px'});
        } else if ($('.mjs-video-player').find('iframe').length > 0) {
            $('.mjs-video-player > iframe').css({'border':borderWidth+'px solid #'+color1, 'border-radius':borderRadius+'px'});
        } 
        $('.mjs-title-area').css({'color':'#'+c2,'background':'#'+c1, 'border-radius':Math.round(borderRadius/2)+'px'});
        $('.mjs-close,.mjs-facebook,.mjs-twitter').css({'color':'#'+color2});
    };
    
    // color loading spinner
    var _mjsColorSpin = function (color1, color2) {
        $('.mjs-parent-spin').css({'background':'#'+color1, 'color':'#'+color2});
    };
    

    // Keyboard control
    var _makeKeyboard = function(e) {
        e.stopPropagation();  
        var imageSelected  = e.data.param1.find('img');
        switch(e.which) {
            case 32: // Spacebar
            e.preventDefault();
            if ($(document).find('.mjs-fullscreen').length <= 0) {
                if (e.data.param1.hasClass('mjs-generic')) {
                    imageSelected.trigger('click');
                } else {
                    e.data.param1.trigger('click');
                }
            }
            break;
            case 27:  // Esc
            e.preventDefault();
            $('.mjs-fullscreen').fadeOut(300,function() {
                $(this).remove();
                _mjsUnsetItemOn();
                $(document).trigger('mjsMediaOffStage');
            });
            break;
            case 37: // Left Arrow
            e.preventDefault();
            $('.mjs-previous').trigger('click'); 
            break;
            case 39: // Right  Arrow
            e.preventDefault();
            $('.mjs-next').trigger('click'); 
            break;
            default: return;
            }
        }
            
    // Deeplinking
    var _mjsDirectAccess = function (elmentid, gallery) {
        var urlWithQuery = $(location).attr('search');
        urlWithQuery = urlWithQuery.substr(1).split('&');
        for (var k = 0; k < urlWithQuery.length; k++) {
            var splitter = urlWithQuery[k].split('=');
            if (splitter[0] === 'magnetid') {
                if (gallery && splitter[1] === elmentid) {
                     $('img#mjsThumb'+splitter[1].substr(splitter[1].length - 1)).trigger('click');
                } else if (!gallery && (elmentid.indexOf(splitter[1]) > 1 || elmentid === splitter[1])) {
                    $('#'+splitter[1].replace('mjs', '')).trigger('click');
                }
            }
        }
    }
    
    // function to update state of touchmove event
    var _mjsCheckTouchMouve = function (event) {
        if (Math.abs(event.originalEvent.touches[0].clientX - mjsGlobal['startX']) > 10 || Math.abs(event.originalEvent.touches[0].clientY - mjsGlobal['startY']) > 10) {
            mjsGlobal['hasTouchMove'] = true;
            $(document).off('touchmove',_mjsCheckTouchMouve);
        }
    }
    
    // function to update state of swipe event
    var _mjsCheckSwipe = function (event) {
        if (event.originalEvent.touches[0].clientX - mjsGlobal['startX'] > 50) {
            mjsGlobal['hasSwipe'] = true;
            mjsGlobal['hasSwipeLeft'] = true;
            $(document).off('touchmove',_mjsCheckSwipe);
        } else if (mjsGlobal['startX'] - event.originalEvent.touches[0].clientX > 50) {
            mjsGlobal['hasSwipe'] = true;
            mjsGlobal['hasSwipeRight'] = true;
            $(document).off('touchmove',_mjsCheckSwipe);
        }
    }
    
    /** public methods **/
    // init and DOM manipulation
    Magneticmediajs.prototype.init = function() {
        if (this.elements === null) {
            return null;
        }else {
            var elements = $.trim(this.elements).split(',');
        }
        var inputSettings = this.settings;
        var settings = this._defaults;
		// validate input values
        for (var properties in settings) {
            if (typeof inputSettings[properties] !== "undefined") {
                if (typeof inputSettings[properties] !== typeof settings[properties]) {
                    console.log('Invalid input settings (typeof) for Magneticmedisjs');
                    return null;
                }
                settings[properties] = inputSettings[properties];
            }
        }    
        // get data array
        var data = this.data;
        // check values are strings return otherwise
        if (data.constructor  !== Array) { 
            console.log('Invalid data array - not an Array');
            return null;
        }
        var arrayDataLenth = data.length;
        if (arrayDataLenth < 1) return null;
        for (var k = 0; k < data.length; k++) {
            var currentData = data[k];
            if (currentData.constructor !== Array) {
                console.log('Invalid data array - not an Array of Array');
                return null;    
            }
            var secondaryArrayDataLenth = currentData.length;
            if (secondaryArrayDataLenth < 2) return null;
            for (var l = 0; l < secondaryArrayDataLenth; l++) {
                if (typeof currentData[l] !== 'string' && ((currentData[0] === 'maps') && typeof currentData[l] !== 'number')) {
                    console.log('Invalid data array - only strings are valid for data array content' + typeof currentData[l]);
                    return null;    
                }
            }
        }
            
        var gallery = settings.gallery;
        var galleryMaxThumbnailHeight = settings.galleryMaxThumbnailHeight;
		var thumbnailPadding = settings.thumbnailPadding;
		var thumbnailBorderWidth = settings.thumbnailBorderWidth;
		var thumbnailBorderRadius = settings.thumbnailBorderRadius;
		var thumbnailBorderColor = settings.thumbnailBorderColor; 
        var videoWidth = settings.videoWidth;
        var videoHeight = settings.videoHeight;
        var autoPlayVideo = settings.autoPlayVideo;
        var zoomOn = settings.zoomOn;
        var zoomLevel = settings.zoomLevel;
        if (zoomLevel < 1) {
            zoomLevel = 1;
        } else if (zoomLevel > 4) {
            zoomLevel = 4;
        }
        var zoomType = settings.zoomType;
        var zoomSize = settings.zoomSize;
        var displayTitle = settings.displayTitle;
        var color1 = settings.color1;
        var color2 = settings.color2;
		var filter = settings.filter;
        var borderWidth = settings.borderWidth;
        if (borderWidth > 20) {
            borderWidth = 20;
        } else if (borderWidth < 0) {
            borderWidth = 0;
        }
        var borderRadius = settings.borderRadius;
        if (borderRadius > 20) {
            borderRadius = 20;
        } else if (borderRadius < 0) {
            borderRadius = 0;
        }
        var background = settings.background;
        var backgroundOpacity = settings.backgroundOpacity;
        var sharing = settings.sharing;
        var facebookID = settings.facebookID;
        var ecommerce = settings.ecommerce;
        if (ecommerce) {
            gallery = true;
        }    
        var showIcons = settings.showIcons;
        
        // Callbacks
        var onMjsMediaOnStage = settings.onMjsMediaOnStage;
        var onMjsMediaOffStage = settings.onMjsMediaOffStage;
        
        // initialize other local variables
        var multiple = false;
        if (gallery) {
            multiple = true;
        }
        var nbOfData = data.length;
        var percentPerImage = 100/nbOfData;
        _mjsGetLocationProtocol();
        
        // loop for multiple separated elements submitted  new Magneticmediajs('#id, #id2, .class1' ...);
        for (var i = 0; i < elements.length; i++) {
            var thisContainer = $($.trim(elements[i]));
            if (!multiple) {
                thisContainer.attr('tabindex','0');
            }
            var imageOnNumber = 0;
            var thumbLoadCount = 0;
            
            // listener for callbacks
            $(document).on('mjsMediaOnStage', function() {
                onMjsMediaOnStage();
            });
            $(document).on('mjsMediaOffStage', function() {
                onMjsMediaOffStage();
            });
            
            // append loading bar only once
            if (!$('body').has('.mjs-parent-spin').length) {
                $('body').append('<div class="mjs-parent-spin"><span class="mjs-s-spin animate-spin"></span></div>');
                _mjsColorSpin(color1, color2);
            }
            
            // hide gallery while content is loading (if gallery is active)
            if (gallery) {
                thisContainer.addClass('mjs-row-gallery');
                thisContainer.hide();
            }
             
            // loop through the array data
            for (var j = 0; j < nbOfData; j++) {
                // render gallery thumbnails
                if (gallery) {
                    var tempSelectorID = 'mjs'+j;
                    if (ecommerce) {
                        if (j === 0) {
                            thisContainer.addClass('mjs-ecommerce-gallery');
                            thisContainer.append('<div class="mjs-generic mjs-ecommerce-main" tabindex="0"><img id="mjsThumb'+j+'" src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs%3D" /></div>');
                        } else {
                            if( j === 1){
                                thisContainer.append('<div id="mjs-ecommerce-col"></div>');
                            }
                            $('#mjs-ecommerce-col').append('<div class="mjs-generic mjs-ecommerce-col-img" tabindex="0"><img id="mjsThumb'+j+'" src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs%3D" /></div>');
                        }
                    } else {
                    thisContainer.append('<div class="mjs-generic" tabindex="0"><img id="mjsThumb'+j+'" src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs%3D" /></div>');
                    }
                    $('#mjsThumb'+j).on('error', {param: j}, function(event) {
                        var number = event.data.param;
                        $('#mjsThumb'+number).parent().remove();
                        mjsGlobal['loadError'] = mjsGlobal['loadError'] + 1;
                    });
                    $('#mjsThumb'+j).on('load',function() {
                        if ($(this).attr('src') !== 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs%3D') {
                            thumbLoadCount = thumbLoadCount + 1;
                        }
                    });
                    if (data[j][0] === 'youtube') {
                        _getYTThumbnail(data[j][1], data[j][2], j);    
                    } else if (data[j][0] === 'vimeo') {
                        _getVimeoThumbnail(data[j][1], data[j][2], j);    
                    } else if (data[j][0] === 'dailymotion') {
                        _getDMThumbnail(data[j][1], data[j][2], j);    
                    } else {
                        if (data[j][0] === 'flickr') {
                            _mjsGetFlickrStream(data[j][1], data[j][2], j, 'thumbnail', '', '', '', '', '', '', '', '', '', '',filter);
                        } else if(data[j][0] === 'instagram') {
                            $('#mjsThumb'+j).prop('src', mjsGlobal['locationProtocol']+'//instagram.com/p/'+data[j][1]+'/media/?size=m');
                        } else {
                            $('#mjsThumb'+j).prop('src', data[j][1]);
                        }
                    }
                    if (showIcons) {
                        if (data[j][0] === 'video' || data[j][0] === 'youtube' || data[j][0] === 'vimeo' || data[j][0] === 'dailymotion') {
                            $('#mjsThumb'+j).parent().append('<div class="mjs-video-play-gallery mjs-i-play-circled"></div>');
                        } else if(data[j][0] === 'maps') {
                            $('#mjsThumb'+j).parent().append('<div class="mjs-video-play-gallery mjs-i-location"></div>');
                        } /*else {
                            $('#mjsThumb'+j).parent().append('<div class="mjs-video-play-gallery mjs-i-picture"></div>');
                        }*/
                    }
                    $('.mjs-video-play-gallery').css({'color':'#'+color2});
                    var tempSelector = $('#mjsThumb'+j).parent().children();
                    var indexOne = 1;
                } else {
                    if (typeof thisContainer.attr('id') !== 'undefined') {
                        var tempSelectorID = 'mjs'+thisContainer.attr('id');
                    } else {
                        // random value based on absolute position of element
                        var tempSelectorID = thisContainer.offset().left+thisContainer.offset().top;
                    }
                    var tempSelector = thisContainer;
                    var indexOne = 0;
                }
                
                // set max width and height for video content and borderWidth/borderRadius unique for each id on which magneticmediajs is fired
                mjsGlobal['borderWidth'][tempSelectorID] = borderWidth;
                mjsGlobal['borderRadius'][tempSelectorID] = borderRadius;
                mjsGlobal['videoWidth'][tempSelectorID] = videoWidth;
                mjsGlobal['videoHeight'][tempSelectorID] = videoHeight;
                
                // add touch support for touch device to trigger overlay content
                tempSelector.on('touchstart', function(event) {
                    if ($('body').has('.mjs-fullscreen').length) {
                        return;
                    }
                    $(document).off('touchmove', _mjsCheckTouchMouve);
                    mjsGlobal['hasTouchMove'] = false;
                    mjsGlobal['startX'] = event.originalEvent.touches[0].clientX;
                    mjsGlobal['startY'] = event.originalEvent.touches[0].clientY;
                    $(document).on('touchmove', _mjsCheckTouchMouve);
                    $(this).on('touchend', function doTouchEnd(event){
                        $(document).off('touchmove', _mjsCheckTouchMouve);
                        if (!mjsGlobal['hasTouchMove']) {
                            event.stopPropagation();
                            event.preventDefault();
                            event.target.click();
                        }
                        $(this).off('touchend', doTouchEnd);
                    });
                });
                
                // handle triggering of overlay content
                tempSelector.on('click', {param: j}, function(event) {
                    if ($('body').has('.mjs-fullscreen').length) {
                        return;
                    }
                    mjsGlobal['timeSpacer'] = true;
                    setTimeout(function() {
                        mjsGlobal['timeSpacer'] = false;
                    }, 500);
                    event.stopPropagation();
                    $('#mjs-zoom-box').remove();
                    $('.mjs-fs-wrapper').off('mouseleave mouseenter');
                    imageOnNumber = event.data.param;
                    var mjsTitle = '';
                    $('body').append('<div class="mjs-fullscreen"></div>');
                    $('.mjs-parent-spin').show();
                    $('.mjs-parent-spin').addClass('mjs-do-spin');
                    _mjsColorSpin(color1,color2);
                    var backgroundR = _mjsHexToRgb("#"+background).r;
                    var backgroundG = _mjsHexToRgb("#"+background).g;
                    var backgroundB = _mjsHexToRgb("#"+background).b;
                    var voWidthViewport = $(window).width();
                    var voHeightViewport = _mjsGetAccurateHeight();
                    $('.mjs-fullscreen').css({'width':voWidthViewport+'px', 'height':voHeightViewport+'px', 'background':'rgba('+backgroundR+','+backgroundG+','+backgroundB+','+backgroundOpacity+')'});
                    var uniqueId = '';
                    if (nbOfData > 1 && multiple) {
                        uniqueId = 'mjs'+imageOnNumber;
                    } else {
                        uniqueId = tempSelectorID;
                    }
                    $('.mjs-fullscreen').append('<div class="mjs-fs-wrapper" id="'+uniqueId+'"><div class="mjs-close mjs-icons mjs-i-cancel"></div></div>');
                    if (sharing) {
                        $('.mjs-fs-wrapper').append('<div class="mjs-facebook mjs-icons mjs-i-facebook-squared"></div><div class="mjs-twitter mjs-icons mjs-i-twitter-squared"></div>');
                    }
                    if (displayTitle) {
                        if ((data[imageOnNumber][0] === 'image' || data[imageOnNumber][0] === 'instagram') && !gallery && (typeof data[imageOnNumber][2] !== 'undefined')) {
                            mjsTitle = data[imageOnNumber][2];
                        } else if (typeof data[imageOnNumber][3] !== 'undefined') {
                            mjsTitle = data[imageOnNumber][3];
                        }
                    }
                    _mjsSetItemOn(data[imageOnNumber][0]);
                    
                    // current content in the data array is an image
                    if (data[imageOnNumber][0] === 'image') {
                        _mjsLoadImage(data[imageOnNumber][indexOne+1],zoomOn,zoomLevel,zoomType,zoomSize,displayTitle,mjsTitle,color1,color2,borderWidth,borderRadius,multiple,filter);
                    }
                    // current content in the data array is flickr content
                    else if (data[imageOnNumber][0] === 'flickr') {
                        _mjsGetFlickrStream(data[imageOnNumber][1], data[imageOnNumber][2], imageOnNumber,'big',zoomOn,zoomLevel,zoomType,zoomSize,displayTitle,mjsTitle,color1,color2,borderWidth,borderRadius,multiple,filter);
                    }
                    // current content in the data array is instagram content
                    else if (data[imageOnNumber][0] === 'instagram') {
                        _mjsLoadImage(mjsGlobal['locationProtocol']+'//instagram.com/p/'+data[imageOnNumber][indexOne+1]+'/media/?size=l',zoomOn,zoomLevel,zoomType,zoomSize,displayTitle,mjsTitle,color1,color2,borderWidth,borderRadius,multiple,filter);
                    }
                    // current content in the data array is video content in a gallery
                    else if ((data[imageOnNumber][0] === 'video' || data[imageOnNumber][0] === 'youtube' || data[imageOnNumber][0] === 'vimeo' || data[imageOnNumber][0] === 'dailymotion')) {
                        if (multiple) {
                            _mjsLoadVideo(data[imageOnNumber][0],data[imageOnNumber][1],videoWidth,videoHeight,autoPlayVideo,displayTitle,mjsTitle,color1,color2,borderWidth,borderRadius,multiple,data[imageOnNumber][2]);
                        } else {
                            _mjsLoadVideo(data[imageOnNumber][0],'mjsSingleItem',videoWidth,videoHeight,autoPlayVideo,displayTitle,mjsTitle,color1,color2,borderWidth,borderRadius,multiple,data[imageOnNumber][1]);
                        }
                    }
                    // current content in the data array is Google Maps content in a gallery
                    else if (data[imageOnNumber][0] === 'maps') {
                        if (multiple) {
                            _mjsLoadMaps(color1,color2,borderWidth,borderRadius,data[imageOnNumber][2],data[imageOnNumber][3],data[imageOnNumber][4],data[imageOnNumber][5],data[imageOnNumber][6],data[imageOnNumber][7],multiple);
                        } else {
                            _mjsLoadMaps(color1,color2,borderWidth,borderRadius,data[imageOnNumber][1],data[imageOnNumber][2],data[imageOnNumber][3],data[imageOnNumber][4],data[imageOnNumber][5],data[imageOnNumber][6],multiple);
                        }
                    }
    
                    //previous / next button for gallery
                    if (nbOfData > 1 && multiple) {
                        $('.mjs-fs-wrapper').append('<div class="mjs-previous mjs-i-left-open"></div><div class="mjs-next mjs-i-right-open"></div>');
                        $('.mjs-next,.mjs-previous').css({'color':'#'+color2});
                        $('.mjs-previous').on('touchstart', function(event) {
                            event.stopPropagation();
                            event.preventDefault();
                            event.target.click();
                        });
                        $('.mjs-previous').on('click', function() {
                            $('#mjs-zoom-box').remove();
                            $('.mjs-fs-wrapper').off('mouseleave mouseenter');
                            imageOnNumber--;
                            if (imageOnNumber === -1) {
                                imageOnNumber = nbOfData-1;
                            }
                            $('.mjs-title-area').remove();
                            if (displayTitle) {
                                if (typeof data[imageOnNumber][3] !== 'undefined') {
                                    mjsTitle = data[imageOnNumber][3];
                                } else {
                                    mjsTitle = '';
                                }
                            }
                            var jToRemove;
                            if (mjsGlobal['itemOnStage'] && mjsGlobal['itemType'] === 'image') {
                                jToRemove = $('.mjs-fs-wrapper > img');
                            } else if (mjsGlobal['itemOnStage'] && mjsGlobal['itemType'] === 'video') {
                                jToRemove = $('.mjs-video-player');
                            } else if (mjsGlobal['itemOnStage'] && mjsGlobal['itemType'] === 'maps') {
                                jToRemove = $('.map-area');
                            }
                            _mjsSetItemOn(data[imageOnNumber][0]);
                            if (data[imageOnNumber][0] === 'instagram') {
                                jToRemove.fadeOut(200,function(){
                                    $(this).remove();
                                    $(document).trigger('mjsMediaOffStage');
                                    _mjsLoadImage(mjsGlobal['locationProtocol']+'//instagram.com/p/'+data[imageOnNumber][2]+'/media/?size=l',zoomOn,zoomLevel,zoomType,zoomSize,displayTitle,mjsTitle,color1,color2,borderWidth,borderRadius,multiple,filter);    
                                });
                            } else if (data[imageOnNumber][0] === 'flickr') {
                                jToRemove.fadeOut(200,function(){
                                    $(this).remove();
                                    $(document).trigger('mjsMediaOffStage');
                                    _mjsGetFlickrStream(data[imageOnNumber][1],data[imageOnNumber][2], imageOnNumber,'big',zoomOn,zoomLevel,zoomType,zoomSize,displayTitle,mjsTitle,color1,color2,borderWidth,borderRadius,multiple,filter);
                                });
                            } else if (data[imageOnNumber][0] === 'image') {
                                jToRemove.fadeOut(200,function(){
                                    $(this).remove();
                                    $(document).trigger('mjsMediaOffStage');
                                    _mjsLoadImage(data[imageOnNumber][2],zoomOn,zoomLevel,zoomType,zoomSize,displayTitle,mjsTitle,color1,color2,borderWidth,borderRadius,multiple,filter);
                                });
                            } else if (data[imageOnNumber][0] === 'video' || data[imageOnNumber][0] === 'youtube' || data[imageOnNumber][0] === 'vimeo' || data[imageOnNumber][0] === 'dailymotion') {
                                jToRemove.fadeOut(200,function(){
                                    $(this).remove();
                                    $(document).trigger('mjsMediaOffStage');
                                    _mjsLoadVideo(data[imageOnNumber][0],data[imageOnNumber][1],videoWidth,videoHeight,autoPlayVideo,displayTitle,mjsTitle,color1,color2,borderWidth,borderRadius,multiple,data[imageOnNumber][1]);
                                });
                            } else if(data[imageOnNumber][0] === 'maps'){
                                jToRemove.fadeOut(200,function(){
                                    $(this).remove();
                                    $(document).trigger('mjsMediaOffStage');
                                    _mjsLoadMaps(color1,color2,borderWidth,borderRadius,data[imageOnNumber][2],data[imageOnNumber][3],data[imageOnNumber][4],data[imageOnNumber][5],data[imageOnNumber][6],data[imageOnNumber][7],multiple);
                                });
                            }
                            $('.mjs-fs-wrapper').attr('id', 'mjs'+imageOnNumber);
                        });
                            
                        $('.mjs-next').on('touchstart', function(event) {
                            event.stopPropagation();
                            event.preventDefault();
                            event.target.click();
                        });
                        $('.mjs-next').on('click', function() {
                            $('#mjs-zoom-box').remove();
                            $('.mjs-fs-wrapper').off('mouseleave mouseenter');
                            imageOnNumber++;
                            if (imageOnNumber === nbOfData) {
                                imageOnNumber = 0;
                            }
                            $('.mjs-title-area').remove();
                            if (displayTitle) {
                                if (typeof data[imageOnNumber][3] !== 'undefined') {
                                    mjsTitle = data[imageOnNumber][3];
                                } else {
                                    mjsTitle = '';
                                }
                            }
                            var jToRemove;
                            if (mjsGlobal['itemOnStage'] && mjsGlobal['itemType'] === 'image') {
                                jToRemove = $('.mjs-fs-wrapper > img');
                            }
                            else if (mjsGlobal['itemOnStage'] && mjsGlobal['itemType'] === 'video') {
                                jToRemove = $('.mjs-video-player');
                            } else if (mjsGlobal['itemOnStage'] && mjsGlobal['itemType'] === 'maps') {
                                jToRemove = $('.map-area');
                            }
                            _mjsSetItemOn(data[imageOnNumber][0]);
                            if (data[imageOnNumber][0] === 'instagram') {
                                jToRemove.fadeOut(200, function() {
                                    $(this).remove();
                                    $(document).trigger('mjsMediaOffStage');
                                    _mjsLoadImage(mjsGlobal['locationProtocol']+'//instagram.com/p/'+data[imageOnNumber][2]+'/media/?size=l',zoomOn,zoomLevel,zoomType,zoomSize,displayTitle,mjsTitle,color1,color2,borderWidth,borderRadius,multiple,filter);
                                    
                                });
                            } else if (data[imageOnNumber][0] === 'flickr') {
                                jToRemove.fadeOut(200, function() {
                                    $(this).remove();
                                    $(document).trigger('mjsMediaOffStage');
                                    _mjsGetFlickrStream(data[imageOnNumber][1], data[imageOnNumber][2], imageOnNumber, 'big',zoomOn,zoomLevel,zoomType,zoomSize,displayTitle,mjsTitle,color1,color2,borderWidth,borderRadius,multiple,filter);
                                });
                            } else if (data[imageOnNumber][0] === 'image') {
                                jToRemove.fadeOut(200, function() {
                                    $(this).remove();
                                    $(document).trigger('mjsMediaOffStage');
                                    _mjsLoadImage(data[imageOnNumber][2],zoomOn,zoomLevel,zoomType,zoomSize,displayTitle,mjsTitle,color1,color2,borderWidth,borderRadius,multiple,filter);
                                });
                            } else if (data[imageOnNumber][0] === 'video' || data[imageOnNumber][0] === 'youtube' || data[imageOnNumber][0] === 'vimeo' || data[imageOnNumber][0] === 'dailymotion'){
                                jToRemove.fadeOut(200, function() {
                                    $(this).remove();
                                    $(document).trigger('mjsMediaOffStage');
                                    _mjsLoadVideo(data[imageOnNumber][0],data[imageOnNumber][1],videoWidth,videoHeight,autoPlayVideo,displayTitle,mjsTitle,color1,color2,borderWidth,borderRadius,multiple,data[imageOnNumber][1]);
                                });
                            } else if(data[imageOnNumber][0] === 'maps') {
                                jToRemove.fadeOut(200, function() {
                                    $(this).remove();
                                    $(document).trigger('mjsMediaOffStage');
                                    _mjsLoadMaps(color1,color2,borderWidth,borderRadius,data[imageOnNumber][2],data[imageOnNumber][3],data[imageOnNumber][4],data[imageOnNumber][5],data[imageOnNumber][6],data[imageOnNumber][7],multiple);
                                });
                            }
                            $('.mjs-fs-wrapper').attr('id', 'mjs'+imageOnNumber);
                        });        
                    } 
                    
                    // closing the on stage media 
                    $('.mjs-fullscreen').on('touchstart', function(event) {
                        if (!mjsGlobal['timeSpacer']) {
                            event.stopPropagation();
                            event.preventDefault();
                            var target = $(event.target);
                            if (typeof target[0].src !== 'undefined' && (target[0].src.indexOf('maps.gstatic.com') > -1)) {
                                return;
                            } 
                            $(document).off('touchmove', _mjsCheckTouchMouve);
                            mjsGlobal['hasSwipe'] = false;
                            mjsGlobal['hasSwipeLeft'] = false;
                            mjsGlobal['hasSwipeRight'] = false;
                            mjsGlobal['startX'] = event.originalEvent.touches[0].clientX;
                            mjsGlobal['startY'] = event.originalEvent.touches[0].clientY;
                            $(document).on('touchmove', _mjsCheckSwipe);
                            $(this).on('touchend',function doTouchEnd2(event){
                                $(document).off('touchmove',_mjsCheckSwipe);
                                if (!mjsGlobal['hasSwipe']) {
                                    event.target.click();
                                } else {
                                    if (mjsGlobal['hasSwipeLeft']) $('.mjs-next').trigger('click');
                                    else if (mjsGlobal['hasSwipeRight']) $('.mjs-previous').trigger('click');
                                }
                                $(this).off('touchend',doTouchEnd2);
                            });
                        } else {
                            event.stopPropagation();
                            event.preventDefault();
                        }
                    });
                    $('.mjs-fullscreen').on('click', function(event) {
                        if (!mjsGlobal['timeSpacer']) {
                            var target = $(event.target);
                            if (typeof target[0].src !== 'undefined' && (target[0].src.indexOf('maps.gstatic.com') > -1)) {
                            } else if (!target.parents('.mjs-fs-wrapper').length || target.hasClass('mjs-close')) { 
                                $('.mjs-fullscreen').fadeOut(300,function(){
                                    $(this).remove();
									$('.mjs-parent-spin').removeClass('mjs-do-spin');
                                    $('.mjs-parent-spin').hide();
                                    _mjsUnsetItemOn(mjsGlobal);
                                    $(document).trigger('mjsMediaOffStage');
                                });
                            }
                            //fix no scroll after zoom for touch devices
                            $(document).off('touchstart', _mjsZoomSubProcess);
                        } else {
                            event.stopPropagation();
                            event.preventDefault();
                        }
                    });    
                });
                _mjsDirectAccess(tempSelectorID, gallery); 
                
                // add twitter and facebook sharing buttons
                if (sharing) {
                    $(document).on('touchstart', '#'+tempSelectorID+' > .mjs-facebook', function(event) {
                        event.stopPropagation();
                        event.preventDefault();
                        event.target.click();
                    });
                    $(document).on('click', '#'+tempSelectorID+' > .mjs-facebook', function() {
                        var currentUrl = window.location.origin+window.location.pathname;
                        currentUrl = currentUrl+'?magnetid='+$('.mjs-fs-wrapper').attr('id');
                        var url = mjsGlobal['locationProtocol']+'//www.facebook.com/dialog/share?app_id='+facebookID+'&display=popup&href='+encodeURIComponent(currentUrl)+'&redirect_uri='+(currentUrl);
                        window.open(url, '_blank');
                    });
                    $(document).on('touchstart', '#'+tempSelectorID+' > .mjs-twitter', function(event) {
                        event.stopPropagation();
                        event.preventDefault();
                        event.target.click();
                    });
                    $(document).on('click', '#'+tempSelectorID+' .mjs-twitter', function() {
                        var currentUrl = window.location.origin+window.location.pathname;
                        currentUrl = currentUrl+'?magnetid='+$('.mjs-fs-wrapper').attr('id');
                        var url = mjsGlobal['locationProtocol']+'//twitter.com/share?url='+encodeURIComponent(currentUrl);
                        window.open(url,'_blank');
                    });
                }
            }

            
            // render gallery when all content is loaded
            if (gallery) {
                var thumbTimer = setInterval(function(){
                    if (thumbLoadCount >= nbOfData - mjsGlobal['loadError']) {    
                        thisContainer.show(0, function() {
                            if (ecommerce) {
                                var colHeight = $('#mjs-ecommerce-col').height();
                                if (colHeight >  $('.mjs-ecommerce-main').height()) {
                                    $('.mjs-ecommerce-gallery').height(colHeight);
                                    $('.mjs-ecommerce-main').addClass('mjs-ecommerce-main-adjust');
                                }
                            }        
                        });
                        clearInterval(thumbTimer);
                    }
                }, 100);
                $('.mjs-generic').css({'border':thumbnailBorderWidth+'px solid #'+thumbnailBorderColor,'-webkit-border-radius':thumbnailBorderRadius+'px','-moz-border-radius':thumbnailBorderRadius+'px','border-radius':thumbnailBorderRadius+'px','padding':thumbnailPadding+'px'});
                $('.mjs-generic img').css({'max-height':galleryMaxThumbnailHeight+'px','background':'#'+color1,'border':'none'});   
            }
            
            // add keyboard control
            if (!multiple) {
                thisContainer.on('focusout', function() {
                    $(document).off('keydown',_makeKeyboard);
                });
                thisContainer.on('focusin', function() {
                    var currentItem = $(this);
                    $(document).on('keydown', {param1:currentItem}, _makeKeyboard);
                });
            } else {
                $('.mjs-generic').on('focusout', function() {
                    $(document).off('keydown', _makeKeyboard);
                });
                $('.mjs-generic').on('focusin', function() {
                    var currentItem = $(this);
                    $(document).on('keydown', {param1:currentItem}, _makeKeyboard);
                });
            }
            
            // handle responsive resizing
            var inResizing = false; 
            $(window).on('resize', function() {
                if (!inResizing) {
                    setTimeout(function() {
                        var width = $('.mjs-fs-wrapper').width();
                        var height = $('.mjs-fs-wrapper').height();
                        var newVoWidthViewport = $(window).width();
                        var newVoHeightViewport = _mjsGetAccurateHeight();
                        if (ecommerce) {
                            var colHeight = $('#mjs-ecommerce-col').height();
                            if (colHeight >  $('.mjs-ecommerce-main').height()){
                                $('.mjs-ecommerce-gallery').height(colHeight);
                                $('.mjs-ecommerce-main').addClass('mjs-ecommerce-main-adjust');
                            } else {
                                $('.mjs-ecommerce-main').removeClass('mjs-ecommerce-main-adjust');
                            }
                        }    
                        var contentType = '';
                        var result = [];
                        var leftPosGallery = thisContainer.position().left;
                        var currentId = $('.mjs-fs-wrapper').attr('id');
                        var borderWidth = mjsGlobal['borderWidth'][currentId];
                        var borderRadius = mjsGlobal['borderRadius'][currentId];
                        if (mjsGlobal['itemOnStage'] && mjsGlobal['itemType'] === 'image') {
                            contentType = 'picture';
                            result = _mjsMakeItFit(width,height,newVoWidthViewport,newVoHeightViewport,borderWidth,borderRadius,contentType);
                        } else if (mjsGlobal['itemOnStage'] && mjsGlobal['itemType'] === 'video') {
                            contentType = 'video';
                            result = _mjsMakeItFit(width,height,newVoWidthViewport,newVoHeightViewport,borderWidth,borderRadius,contentType);
                        } else if(mjsGlobal['itemOnStage'] && mjsGlobal['itemType'] === 'maps') {
                            contentType = 'maps';
                            result = _mjsMakeItFit(width,height,newVoWidthViewport,newVoHeightViewport,borderWidth,borderRadius,contentType);
                        }
                        width = result[0];
                        height = result[1];
                        var tempBorderWidth = result[2];
                        var tempBorderRadius = result[3];
                        $('.mjs-fullscreen').css({'width':newVoWidthViewport+'px','height':newVoHeightViewport+'px'});
                        if (contentType === 'maps') {
                            $('.mjs-fs-wrapper').css({'width':width+'px', 'height':height+'px'});
                            google.maps.event.trigger(mjsGlobal['mapInstance'], 'resize');
                        } else {
                            $('.mjs-fs-wrapper').css({'width':width+'px', 'height':height+'px'});
                            if (contentType === 'video') {
                                $('.mjs-video-player').css({'width':width+'px', 'height':height+'px'});    
                                var iFrameWidth = 0;
                                var iFrameHeight = 0;
                                var currentIdInResize = $('.mjs-fs-wrapper').attr('id');
                                if (width > mjsGlobal['videoWidth'][currentIdInResize]) {
                                    iFrameWidth = mjsGlobal['videoWidth'][currentIdInResize];
                                } else {
                                    iFrameWidth = width;
                                }
                                if (height > mjsGlobal['videoHeight'][currentIdInResize]) {
                                    iFrameHeight = mjsGlobal['videoHeight'][currentIdInResize];
                                } else {
                                    iFrameHeight = height;
                                }
                                $('.mjs-video-player > iframe').css({'width':iFrameWidth+'px','height':iFrameHeight+'px'});    
                            }
                        }
						if ($('.mjs-fullscreen > .mjs-fs-wrapper').find('#mjs-zoom-box').length > 0) {
							$('.mjs-fullscreen').trigger('click');
							var matchId = $('.mjs-fs-wrapper').prop('id').replace('mjs', '');
							setTimeout(function() {
								$('#'+matchId).trigger('click');
							}, 1000);
						}
                        inResizing = false;
                    },100);
                    inResizing = true;
                }
            }); 
        }
    },
        
    // API openMedia mehtod (open an item)
    Magneticmediajs.prototype.openMedia = function(itemId) { 
        if ($('#'+itemId).hasClass('mjs-generic')) {
            $('#'+itemId).find('img').trigger('click');
        } else {
            $('#'+itemId).trigger('click');
        }
        return this;
    },
        
    // API closeMedia mehtod (close an item)
    Magneticmediajs.prototype.closeMedia = function() {
        $('.mjs-close').trigger('click'); 
        return this;
    },
        
    // API previousMedia mehtod (display previous item)
    Magneticmediajs.prototype.previousMedia = function() {
        if (mjsGlobal['itemOnStage']) {
            $('.mjs-previous').trigger('click'); 
        }
        return this;
    },
        
    // API nextMedia mehtod (display next item)
    Magneticmediajs.prototype.nextMedia = function() { 
        if (mjsGlobal['itemOnStage']) { 
            $('.mjs-next').trigger('click'); 
        }
        return this;
    },
        
    // API getOpenedMediaInfo mehtod (get the name of item on stage)
    Magneticmediajs.prototype.getOpenedMediaInfo = function() { 
        if (!mjsGlobal['itemOnStage']) {
            return null;
        } else {
            return mjsGlobal['itemName'];
        }
    },
        
    // Get submitted elements
    Magneticmediajs.prototype.getElements = function(elements) { 
        if (typeof elements === 'string') {
            return elements;
        } else {
            return null;
        }
    },
    
    // Set default values as a public method
    Magneticmediajs.prototype.setDefaults = function(inputDefaults) { 
        var currentDefaults = this._setDefaults;
        for (var properties in currentDefaults) {
              if (typeof inputDefaults[properties] !== "undefined" && (typeof currentDefaults[properties] === typeof inputDefaults[properties])) {
                  this._setDefaults[properties] = inputDefaults[properties];
             }
        }
    }
    
    return Magneticmediajs;
        
})();