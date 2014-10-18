/*
Copyright (C) 2014 Arnaud Leyder at Leyder Consulting

This file is part of Magneticmediajs starter edition v1.1.0

Magneticmediajs starter edition is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Magneticmediajs library starter edition is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Magneticmediajs library starter edition. If not, see http://www.gnu.org/licenses/.

For contact information please visit https://www.magneticmediajs.com/
*/

//global scope variable
var mmItemOnStage = false;
var mmTimerSpin, mmTimerSpin2, mmTimerSpin3;

//jQuery when ready
(function( $ ) {
	
	//function to check if device is iPhone or iPod
	function mmIsIpos(){
		var iOS = navigator.userAgent.toLowerCase().match(/(iphone|ipod)/g) ? true : false ;
		return iOS;
	}
	
	//function to get accurate height of viewport depending on the device
	function mmGetAccurateHeight(){
		if(mmIsIpos()){
			var heightViewport = window.innerHeight;
		}
		else{
			var heightViewport = $(window).height();
		}
		return heightViewport;
	}
	
	//function to check HTML5 video support
	function mmSupportsVideo() {
  		return !!document.createElement('video').canPlayType;
	}
	
	//function to check mp4 video (H264) support
	function mmSupportsMp4(){
		var supports = false;
		if (mmSupportsVideo()){
			var tempVideo = document.createElement('video');
			var videoCanPlay = tempVideo.canPlayType('video/mp4');
			if (videoCanPlay !== ""){supports = true;}
		}
		return supports;
	}
	
	//function to get RGB color from hexadecimal code
	function mmHexToRgb(hex) {
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
	}
	
	//function to fit image to available viewport width and height
	function mmMakeItFit(width,height,widthViewport,heightViewport,borderWidth,borderRadius,contentType){
		var ratio = width/height;
		
		if (widthViewport < 768){
			var borderWidth = borderWidth/2.5;
			var borderRadius = borderRadius/2.5;
			var widthLimit = Math.floor(75*widthViewport/100);
			var heightLimit = Math.floor(75*heightViewport/100);
			}
		else if(widthViewport >= 768 && widthViewport < 1024){
			var borderWidth = borderWidth/1.5;
			var borderRadius = borderRadius/1.5;
			var widthLimit = Math.floor(80*widthViewport/100);
			var heightLimit = Math.floor(80*heightViewport/100);
		}
		else{
			var borderWidth = borderWidth;
			var borderRadius = borderRadius;
			var widthLimit = Math.floor(82*widthViewport/100);
			var heightLimit = Math.floor(82*heightViewport/100);
		}
		
		if ((width > widthLimit) && (height > heightLimit)){
			var width = widthLimit;
			var height = Math.floor(width/ratio);
			if (height > heightLimit){
				height = heightLimit;
				width = Math.floor(height*ratio);
			}
		}
		else if (width > widthLimit){
			var width = widthLimit;
			var height = Math.floor(width/ratio);
			if(contentType === 'maps'){
				if (height < heightLimit){
					height = heightLimit;
				}
			}
		}
		else if(height > heightLimit){
			var height = heightLimit;
			var width = Math.floor(height*ratio);
			if(contentType === 'maps'){
				if (width < widthLimit){
					width = widthLimit;
				}
			}
		}
		else{
			var width = widthLimit;
			var height = Math.floor(width/ratio);
			if (height > heightLimit){
				height = heightLimit;
				width = Math.floor(height*ratio);
			}
		}
		var result = new Array();
		result[0] = width;
		result[1] = height;
		result[2] = borderWidth;
		result[3] = borderRadius;
		return result;
	}
	
	//function to handle rounded border for media content when borderWidth is set to 0
	function adjustRoundBorder(borderWidth,borderRadius){
		if(borderWidth === 0 && borderRadius > 0){
			$('.mmFSWrapper > img').css('border-radius',(borderRadius)+'px');
			$('.mmFSWrapper > video').css('border-radius',(borderRadius)+'px');
		}
	}
	
	//function to load image content
	function mmLoadImage(src,displayTitle,mmTitle,color1,color2,borderWidth,borderRadius,thisContainer){
		var voWidthViewport = $(window).width();
		var voHeightViewport = mmGetAccurateHeight();
		var newImage = new Image();
		newImage.id = 'mmImgFull';
		$(newImage).appendTo('.mmFSWrapper');
		$(newImage).on('load',function(){
			var newSize = mmGetNaturalSize(newImage);
			var width = newSize[0];
			var height = newSize[1];
			var result = mmMakeItFit(width,height,voWidthViewport,voHeightViewport,borderWidth,borderRadius,'picture');
			width = result[0];
			height = result[1];
			var tempBorderWidth = result[2];
			var tempBorderRadius = result[3];
			$('.mmFSWrapper').css({'width':width+'px','height':height+'px','max-width':'','max-height':''}).fadeIn(300);	
			if(displayTitle && mmTitle !== ''){
				$('.mmFSWrapper').append('<div class="mmTitleArea">'+mmTitle+'</div>');
				$('.mmFSWrapper').css({'margin-top':'-15px'});
			}
			mmColorIt(color1,color2,tempBorderWidth,tempBorderRadius);
			clearTimeout(mmTimerSpin);
			clearInterval(mmTimerSpin2);
			clearInterval(mmTimerSpin3);
			$('#mmParentSpin').hide();
			adjustRoundBorder(tempBorderWidth,tempBorderRadius);
		});
		$(newImage).on('error',function(){
			$(this).remove();
			var js ='';
			mmLoadHtml('<div id="mmErrorWrapper"><div id="mmError">An error occurred while loading this content. Please try again later.</div></div>',color1,color2,borderWidth,borderRadius,js,thisContainer);
		});
		newImage.src = src;
	}
	
	//function to load HTML5 video content with Flash fallback
	function mmLoadVideo(type,poster,src,videoWidth,videoHeight,autoPlayVideo,displayTitle,mmTitle,color1,color2,borderWidth,borderRadius,thisContainer){
		var voWidthViewport = $(window).width();
		var voHeightViewport = mmGetAccurateHeight();
		if(src === 'mmSingleItem'){
			src = poster;
			poster = '';
		}
		var displayAutoPlay;
		if(mmSupportsMp4()){
			if(autoPlayVideo){displayAutoPlay = 'autoplay';}
				else{displayAutoPlay='';}
				var videoPlayer = '<video controls poster="'+poster+'" src="'+src+'" class="mmVideoPlayer" '+displayAutoPlay+' preload="auto"></video>';
		}
		else{
			var startingBitratePathF = src;
			var posterF = poster;
			if(startingBitratePathF.substring(0, 5) !== 'http:'){
				startingBitratePathF = '../'+startingBitratePathF;
			}
			if (swfobject.hasFlashPlayerVersion("10")){
				posterF = encodeURIComponent(posterF);
				startingBitratePathF = encodeURIComponent(startingBitratePathF);
				var videoPlayer = '<div class="mmVideoPlayer"><object width="100%" height="100%"><param name="movie" value="flash/StrobeMediaPlayback.swf"></param><param name="flashvars" value="src='+startingBitratePathF+'&poster='+posterF+'&controlBarAutoHide=true&autoPlay='+autoPlayVideo+'"></param><param name="allowFullScreen" value="true"></param><param name="allowscriptaccess" value="always"></param><param name="wmode" value="transparent"></param><embed width="100%" height="100%" src="flash/StrobeMediaPlayback.swf" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" wmode="transparent" flashvars="src='+startingBitratePathF+'&poster='+posterF+'&controlBarAutoHide=true&autoPlay='+autoPlayVideo+'"></embed></object>';
			}
		}
		var result = mmMakeItFit(videoWidth,videoHeight,voWidthViewport,voHeightViewport,borderWidth,borderRadius,'video');
		width = result[0];
		height = result[1];
		var tempBorderWidth = result[2];
		var tempBorderRadius = result[3];
		$('.mmFSWrapper').append(videoPlayer);
		$('.mmFSWrapper,.mmVideoPlayer').css({'width':width+'px','height':height+'px','max-width':videoWidth+'px','max-height':videoHeight+'px'}).fadeIn(300);	
		if(displayTitle && mmTitle !== ''){
			$('.mmFSWrapper').append('<div class="mmTitleArea">'+mmTitle+'</div>');
			$('.mmFSWrapper').css({'margin-top':'-15px'});
		}
		mmColorIt(color1,color2,tempBorderWidth,tempBorderRadius);
		clearTimeout(mmTimerSpin);
		clearInterval(mmTimerSpin2);
		clearInterval(mmTimerSpin3);
		$('#mmParentSpin').hide();
		adjustRoundBorder(tempBorderWidth,tempBorderRadius);
	}
	
	//function to get storage size of image
	function mmGetNaturalSize(img){
		var trueSize = new Array() 
		if (img.naturalWidth) {
			trueSize[0] = img.naturalWidth;
			trueSize[1] = img.naturalHeight;
		}
		else{
			var testImage = new Image();
			testImage.src = img.src;
			$(newImage).on('load',function(){
				trueSize[0] = this.width;
				trueSize[1] = this.height;
			});
		}
		return trueSize;
	}
	
	//function to apply colors to the image on display
	function mmColorIt(color1,color2,borderWidth,borderRadius){
		if(color1 === color2){
			var c1 = color1;
			var c2 = '000';
		}
		else{
			var c1 = color1;
			var c2 = color2;
		}
		$('.mmFSWrapper').css({'border':borderWidth+'px solid #'+color1,'border-radius':borderRadius+'px'});
		$('.mmTitleArea').css({'color':'#'+c2,'background':'#'+c1,'border-radius':Math.round(borderRadius)+'px'});
		$('.mmClose').css({'color':'#'+color2});
	}
	
	//function to apply colors to the loading bar
	function mmColorSpin(color1,color2){
		if(color1 === color2){
			var c1 = color1;
			var c2 = '000';
		}
		else{
			var c1 = color1;
			var c2 = color2;
		}
		$('.mmWaitCircle').css({'background':'#'+c1});
		$('#mmParentSpin').css({'border':'2px solid #'+c1,'background':'#'+c2});
	}
		
	//function for keyboard interaction
	function makeKeyboard(e){
		e.stopPropagation();  
		var imageSelected  = e.data.param1.find('img');
    	switch(e.which) {
        	case 32: // Spacebar
			e.preventDefault();
			if($(document).find('.mmFullScreen').length <= 0){
				if (e.data.param1.hasClass('mmGeneric')){
					imageSelected.trigger('click');
				}
				else{
					e.data.param1.trigger('click');
				}
			}
        	break;
			case 27:  // Escape
			e.preventDefault();
			$('.mmFullScreen').fadeOut(300,function(){
				$(this).remove();
				delete mmMapInstance;
				mmMapInstance = null;
				videoOnStage = false;
				imageOnStage = false;
				htmlOnStage = false;
				mapsOnStage = false;
				mmItemOnStage = false;
			});
        	break;
        	default: return;
    		}
		}

	//function for deeplinking (access each media with a query string)
	function mmDirectAccess(elmentid,gallery,mediaWall){
		var urlWithQuery = $(location).attr('search');
		urlWithQuery = urlWithQuery.substr(1).split('&');
		for (var k = 0; k < urlWithQuery.length; k++){
			if(urlWithQuery[k].split('=')[0] === 'magnetid'){
				if(urlWithQuery[k].split('=')[1] === elmentid){
					if(gallery){
						$('#'+urlWithQuery[k].split('=')[1]+' > img').trigger('click');
					}else if(mediaWall){
						$('#'+urlWithQuery[k].split('=')[1]).trigger('click');
					}
					else{
						var corretId = urlWithQuery[k].split('=')[1]
						corretId = corretId.replace(/^mm/, "");
						$('#'+corretId).trigger('click');
						}
				}
			}
		}
	}
	
	//function to animate loading bar off
	function mmAnimateOff(){
		$('#mmWaitCircle1').animate({ opacity: 0 },400, function() {
			$('#mmWaitCircle2').animate({ opacity: 0 },400, function() {
				$('#mmWaitCircle3').animate({ opacity: 0 },400, function() {
				});
			});
		});
	}
	
	//function to animate loading bar on
	function mmAnimateOn(){
		$('#mmWaitCircle1').animate({ opacity: 1 },400, function() {
			$('#mmWaitCircle2').animate({ opacity: 1 },400, function() {
				$('#mmWaitCircle3').animate({ opacity: 1 },400, function() {
				});
			});
		});
	}
	
	var videoOnStage = false;
	var imageOnStage = false;
	
	var methods = {
		init : function(options) {
		var settings = $.extend({
		// These are the defaults.
		data: [],
		displayTitle:false,
		color1:'080808',
		color2:'fdfdfd',
		borderWidth:8,
		borderRadius:8,
		background:'000000',
		backgroundOpacity:0.7,
		videoWidth:640,
		videoHeight:360,
		autoPlayVideo:false
		}, options );
	 	
		var data =  settings.data;
		var videoWidth = settings.videoWidth;
		var videoHeight = settings.videoHeight;
		var autoPlayVideo = settings.autoPlayVideo;
		var displayTitle = settings.displayTitle;
		var color1 = settings.color1;
		var color2 = settings.color2;
		var borderWidth = settings.borderWidth;
		if (borderWidth > 20){
			borderWidth = 20;
		}
		else if(borderWidth < 0){
			borderWidth = 0;
		}
		var borderRadius = settings.borderRadius;
		if (borderRadius > 20){
			borderRadius = 20;
		}
		else if(borderRadius < 0){
			borderRadius = 0;
		}
		var background = settings.background;
		var backgroundOpacity = settings.backgroundOpacity;

		var thisContainer = $(this);
		$(this).attr('tabindex','0');
		var imageOnNumber = 0;
		var tempSelector = $(this);
		var tempSelectorID = 'mm'+$(this).attr('id');
		var indexOne = 0;
		var touchendOnce = true;
		
		//append loading bar while loading content
		$('body').append('<div id="mmParentSpin"><div class="mmWaitCircle" id="mmWaitCircle1"></div><div class="mmWaitCircle" id="mmWaitCircle2"></div><div class="mmWaitCircle" id="mmWaitCircle3"></div></div>');
		
		//on touchend trigger click
		tempSelector.on('touchend', function(event) {
			if(touchendOnce){
				touchendOnce = false;
				event.stopPropagation();
				event.preventDefault();
				event.target.click();
				setTimeout(function(){
						touchendOnce = true;
				},200);
			}
		});
		
		//display media content as an overlay element
		tempSelector.on('click',function(event){
			event.stopPropagation();
			var mmTitle = '';
			$('body').append('<div class="mmFullScreen"></div>');
			mmTimerSpin = setTimeout(function(){
				$('#mmParentSpin').show();
				mmAnimateOff();
				mmAnimateOn();
				mmTimerSpin2 = setInterval(function(){
					mmAnimateOff();
				},1200);
				mmTimerSpin3 = setInterval(function(){
					mmAnimateOn();
				},1200);
			},300);
			mmColorSpin(color1,color2);
			var backgroundR = mmHexToRgb("#"+background).r;
			var backgroundG = mmHexToRgb("#"+background).g;
			var backgroundB = mmHexToRgb("#"+background).b;
			var voWidthViewport = $(window).width();
			var voHeightViewport = mmGetAccurateHeight();
			$('.mmFullScreen').css({'width':voWidthViewport+'px','height':voHeightViewport+'px','background':'rgba('+backgroundR+','+backgroundG+','+backgroundB+','+backgroundOpacity+')'});
			$('.mmFullScreen').append('<div class="mmFSWrapper" id="'+tempSelectorID+'"><div class="mmClose icon-cancel"></div></div>');
			if(displayTitle){
				if((data[imageOnNumber][0] === 'image') && (typeof data[imageOnNumber][2] !== 'undefined')){
						mmTitle = data[imageOnNumber][2];
					}
				}
			if(data[imageOnNumber][0] === 'image'){
				mmLoadImage(data[imageOnNumber][indexOne+1],displayTitle,mmTitle,color1,color2,borderWidth,borderRadius,thisContainer);
					videoOnStage = false;
					imageOnStage = true;
					mmItemOnStage = true;
				}
			else if(data[imageOnNumber][0] === 'video'){
				mmLoadVideo(data[imageOnNumber][0],data[imageOnNumber][1],'mmSingleItem',videoWidth,videoHeight,autoPlayVideo,displayTitle,mmTitle,color1,color2,borderWidth,borderRadius,thisContainer);
					videoOnStage = true;
					imageOnStage = false;
					mmItemOnStage = true;
			}
				
			//closing button mechanism
			$('.mmFullScreen').on('touchend', function(event) {
				var target = $(event.target);
				if (!target.parents('.mmFSWrapper').length || target.hasClass('mmClose')){ 					
						event.target.click();
				}
			});
			
			$('.mmFullScreen').on('click', function(event) {
				var target = $(event.target);
				if (!target.parents('.mmFSWrapper').length || target.hasClass('mmClose')){ 
					$('.mmFullScreen').fadeOut(300,function(){
							$(this).remove();
							videoOnStage = false;
							imageOnStage = false;
							mmItemOnStage = false;
						});
					}
				});	
			});
		
		//activate deeplinking
		mmDirectAccess(tempSelectorID); 
	
		//allow keyboard interaction
		thisContainer.on('focusout',function(){
			$(document).off('keydown',makeKeyboard);
		});
		thisContainer.on('focusin',function(){;
			$(document).on('keydown',{param1:$(this)},makeKeyboard);
		});
		
		
		//responsive resizing handling
		var inResizing = false; 
		$(window).on('resize',function(){
			if(!inResizing){
				setTimeout(function(){
					var width = $('.mmFSWrapper').width();
					var height = $('.mmFSWrapper').height();
					var newVoWidthViewport = $(window).width();
					var newVoWidthParent = thisContainer.parent().width();
					var newVoHeightViewport = mmGetAccurateHeight();
					var newVoHeightParent = thisContainer.parent().height();
					var contentType = '';
					var result = new Array();
					var leftPosGallery = thisContainer.position().left;
					if(imageOnStage){
						contentType = 'picture';
						result = mmMakeItFit(width,height,newVoWidthViewport,newVoHeightViewport,borderWidth,borderRadius,contentType);
					}
					else if(videoOnStage){
						contentType = 'video';
						result = mmMakeItFit(width,height,newVoWidthViewport,newVoHeightViewport,borderWidth,borderRadius,contentType);
					}
					width = result[0];
					height = result[1];
					var tempBorderWidth = result[2];
					var tempBorderRadius = result[3];
					$('.mmFullScreen').css({'width':newVoWidthViewport+'px','height':newVoHeightViewport+'px'});
					var color1 = $('.mmFSWrapper').css('border-left-color');
					$('.mmFSWrapper').css({'width':width+'px','height':height+'px','border':tempBorderWidth+'px solid '+color1,'border-radius':tempBorderRadius+'px'});
					if(contentType === 'video'){
						$('.mmVideoPlayer').css({'width':width+'px','height':height+'px'});		
					}
					inResizing = false;
				},100);
				inResizing = true;
			}
		});
	return this;
		}
    };
	
	//jQuery plugin authoring
	$.fn.magneticmediajs = function(methodOrOptions) { 
        if ( methods[methodOrOptions] ) {
            return methods[ methodOrOptions ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {
            // Default to "init"
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  methodOrOptions + ' does not exist on jQuery plugin' );
        } 
    };
	
}( jQuery ));