/* 
Copyright (C) 2014 Arnaud Leyder 

This file is part of Magneticmediajs starter edition

Magneticmediajs library starter edition is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Magneticmediajs library starter edition is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Magneticmediajs library starter edition.  If not, see <http://www.gnu.org/licenses/>.

For contact information please visit <http://www.magneticmediajs.com/support.html>
*/

(function( $ ) {
	
	//Get RGB color from hexadecimal code
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
	
	//Fit image to available display width and height
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
	
	//Load image on display
	function mmLoadImage(src,displayTitle,mmTitle,color1,color2,borderWidth,borderRadius){
		var voWidthViewport = $(window).width();
		var voHeightViewport = $(window).height();
		var newImage = new Image();
		newImage.id = 'mmImgFull';
		newImage.src = src;
		$(newImage).appendTo('.mmFSWrapper');
		$(newImage).on('load',function(){
			var newSize = mmGetNaturalSize(newImage);
			var width = newSize[0];
			var height = newSize[1];
			var result = mmMakeItFit(width,height,voWidthViewport,voHeightViewport,borderWidth,borderRadius);
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
		});
	}
	
	//Get storage size of image
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
	
	//Apply colors		
	function mmColorIt(color1,color2,borderWidth,borderRadius){
		$('.mmFSWrapper').css({'border':borderWidth+'px solid #'+color1,'border-radius':borderRadius+'px'});
		$('.mmTitleArea').css({'color':'#'+color2,'background':'#'+color1,'border-radius':Math.round(borderRadius)+'px'});
		$('.mmClose').css({'color':'#'+color2});
	}

	//Deeplinking
	function mmDirectAccess(){
		var urlWithQuery = $(location).attr('search');
		urlWithQuery = urlWithQuery.substr(1).split('&');
		for (var k = 0; k < urlWithQuery.length; k++){
			if(urlWithQuery[k].split('=')[0] === 'magnetid'){
				$('#'+urlWithQuery[k].split('=')[1]).trigger('click');
			}
		}
	}
	
	//Keybaord handling
	function processKeyboard(event){
		event.stopPropagation();  
		var imageSelected = event.data.param1;
    	switch(event.which) {
        	case 32: // space, open item
			event.preventDefault();
			imageSelected.trigger('click');
        	break;
			case 27: // escape, close item
			event.preventDefault();
			$('.mmFullScreen').fadeOut(300,function(){
				$(this).remove();
			});
        	break;
        	default: return; 
    	}
	}
	
	//Start plugin
	$.fn.magneticmediajs = function(options) {
		
		//Default values
		var settings = $.extend({
			data: [],
			displayTitle:false,
			color1:'000000',
			color2:'EEEEEE',
			borderWidth:12,
			borderRadius:6,
			background:'000000',
			backgroundOpacity:0.7,
			manageViewport: true
		}, options );
	 	
		//Setting up variables based on input
		var data =  settings.data;
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
		var manageViewport = settings.manageViewport;
		if (manageViewport){
			var metaViewport = $('meta[name=viewport]');
			if(!(metaViewport.length > 0)){
				$('<meta name="viewport" />').appendTo('head');
				metaViewport = $('meta[name=viewport]');
			}
			metaViewport.attr('content','width=device-width,initial-scale=1,minimal-ui');
		}
		
		//Initalizing jQuery plugin variables
		var voWidthViewport = $(window).width();
		var voHeightViewport = $(window).height();
		var screenWidth = screen.width;
		var screenHeight = screen.height;
		var wrappertWidth = 0;
		var wrappertheight = 0;
		var imageOnStage = false;
		var thisContainer = $(this);
		var thisContainerID = $(this).attr('id');
			//Display content on interaction
			thisContainer.on('touchstart', function(event) {
				event.stopPropagation();
				event.preventDefault();
				event.target.click();
			});
			thisContainer.on('click',function(event){
				event.stopPropagation();
				$('.mmFSWrapper').off('mouseleave mouseenter');
				var mmTitle = '';
				$('body').append('<div class="mmFullScreen"></div>');
				var backgroundR = mmHexToRgb("#"+background).r;
				var backgroundG = mmHexToRgb("#"+background).g;
				var backgroundB = mmHexToRgb("#"+background).b;
				var voWidthViewport = $(window).width();
				var voHeightViewport = $(window).height();
				$('.mmFullScreen').css({'width':voWidthViewport+'px','height':voHeightViewport+'px','background':'rgba('+backgroundR+','+backgroundG+','+backgroundB+','+backgroundOpacity+')'});
				$('.mmFullScreen').append('<div class="mmFSWrapper" id="'+thisContainerID+'"><div class="mmClose icon-cancel"></div></div>');
				if(displayTitle){
					if(data[0][0] === 'image' && (typeof data[0][2] !== 'undefined')){
						mmTitle = data[0][2];
					}
				}
				if(data[0][0] === 'image'){
					mmLoadImage(data[0][1],displayTitle,mmTitle,color1,color2,borderWidth,borderRadius);
					imageOnStage = true;
				}
				
				//Closing button 
				$('.mmFullScreen').on('touchstart', function(event) {
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
							imageOnStage = false;
						});
					}
				});
			
			});
	
		
		//Allow deeplinking 
		mmDirectAccess();
		
		//Allow keyboard interaction
		thisContainer.on('focusout',function(){
			$(document).off('keydown',processKeyboard);
		});
		thisContainer.on('focusin',function(){
			$(document).on('keydown',{param1:$(this)},processKeyboard);
		});

		//Handle resizing for responsive design
		var inResizing = false; 
		$(window).on('resize',function(){
			if(!inResizing){
				setTimeout(function(){
					var width = $('.mmFSWrapper').width();
					var height = $('.mmFSWrapper').height();
					var newVoWidthViewport = $(window).width();
					var newVoHeightViewport = $(window).height();
					var contentType = '';
					var result = new Array();
					if(imageOnStage){
						contentType = 'picture';
						result = mmMakeItFit(width,height,newVoWidthViewport,newVoHeightViewport,borderWidth,borderRadius,contentType);
					}
					width = result[0];
					height = result[1];
					var tempBorderWidth = result[2];
					var tempBorderRadius = result[3];
					$('.mmFullScreen').css({'width':newVoWidthViewport+'px','height':newVoHeightViewport+'px'});
					$('.mmFSWrapper').css({'width':width+'px','height':height+'px','border':tempBorderWidth+'px solid #'+color1,'border-radius':tempBorderRadius+'px'});
					inResizing = false;
				},100);
				inResizing = true;
			}
		});
		
	return this;
	
	};
}( jQuery ));