/**
 * Greenlet Theme JavaScript.
 *
 * @package greenlet\library\js
 */

var greenletLoader = '<svg id="greenlet-loader" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><g id="loader-parts"><circle class="loader-ring" cx="25" cy="25" r="22" /><circle class="loader-c" cx="25" cy="25" r="22" /></g></svg>';

/**
 * Page loader Listener.
 *
 * @param {Event} e Click event.
 */
function greenletLoaderListener(e) {
	e.preventDefault();
	var thisElement = e.target;
	var add         = false;
	var next_page   = 2;

	if ( thisElement.classList.contains( 'next' ) ) {
		next_page = parseInt( document.querySelector( '.pagination span.current' ).textContent ) + 1
	} else if ( thisElement.classList.contains( 'prev' ) ) {
		next_page = parseInt( document.querySelector( '.pagination span.current' ).textContent ) - 1
	} else if ( thisElement.classList.contains( 'load' ) ) {
		next_page = thisElement.getAttribute( 'data-next' );
		add       = true;
	} else {
		next_page = thisElement.textContent;
	}
	greenletPageLoader( this, next_page, add )
}

/**
 * Initialize Pagination Listeners.
 */
function greenletPaginationInit() {
	var loadElements = document.querySelectorAll( '.pagination.load a' );
	var ajaxElements = document.querySelectorAll( '.pagination.ajax a' );
	if ( loadElements.length > 0 ) {
		loadElements[0].addEventListener( 'click', greenletLoaderListener );
	}
	var ajaxElementsLength = ajaxElements.length;
	for (var i = 0; i < ajaxElementsLength; i++) {
		ajaxElements[i].addEventListener( 'click', greenletLoaderListener );
	}
}

greenletPaginationInit();

window.onscroll = function (e) {
	var infinite = document.getElementsByClassName( 'pagination infinite' );
	if (infinite.length > 0) {

		var offset  = infinite[ infinite.length - 1 ].getBoundingClientRect();
		var loadpos = offset.top + 100; // 500
		var wheight = window.innerHeight;
		var sheight	= window.scrollY;
		if ( ( wheight + sheight ) > loadpos ) {
			var link = infinite[ infinite.length - 1 ].querySelector( 'a' );
			if ( link !== null ) {
				var next_page      = link.getAttribute( 'data-next' );
				link.style.display = 'none';
				greenletPageLoader( link, next_page, true );
			}
		}
	}
}

/**
 * Load Paginated content.
 *
 * @param {Node}   obj      Pagination link Node.
 * @param {number} cur_page Current Page Number.
 * @param {bool}   add      Append or Replace.
 * @param {string} act      WordPress action.
 */
function greenletPageLoader( obj, cur_page, add, act ) {
	var nonce = document.getElementById( 'greenlet_generic_nonce' ).value;

	obj.parentNode.parentNode.innerHTML = '<span id="page-loader">' + greenletLoader + '</span>';

	add  = typeof add !== 'undefined' ? add : false;
	act  = typeof act !== 'undefined' ? act : 'greenlet_get_paginated';
	args = {
		location: greenlet_object.current_url,
		page: greenlet_object.page,
		query_vars: greenlet_object.query_vars,
		current: cur_page,
		append: add,
		action: act,
		nonce: nonce
	};

	if ( greenlet_object.permalinks ) {
		if ( ! parseInt( cur_page ) ) {
			cur_page = location.href.replace( /.+\/page\/([0-9]+).+/, "$1" )
		}
		args.location = args.location.replace( /\/?/, "" ) + "/page/" + cur_page + "/"
	} else {
		if ( ! parseInt( cur_page ) ) {
			cur_page = location.href.replace( /.+paged?=([0-9]+).+/, "$1" )
		}
		args.location = args.location.replace( /\/?/, "" ) + "?page=" + cur_page + ""
	}

	var xhr = new XMLHttpRequest();
	xhr.open( 'POST', greenlet_object.ajaxurl, true );
	xhr.setRequestHeader( 'Content-type', 'application/x-www-form-urlencoded' );
	xhr.send( greenletJsonToFormData( args ) );

	xhr.onload = function () {
		var res = JSON.parse( xhr.responseText );
		if ( xhr.readyState === 4 && xhr.status === 200 ) {
			if ( add ) {
				var wrap       = document.querySelector( '.main .wrap' )
				wrap.innerHTML = wrap.innerHTML + res.posts;
			} else {
				document.querySelector( '.main .wrap' ).innerHTML = res.posts
			}
			var pageLoader = document.getElementById( 'page-loader' );
			if ( pageLoader !== null ) {
				pageLoader.parentElement.removeChild( pageLoader );
			}
			greenletPaginationInit();
		}
	}
}

/**
 * Convert JSON to Form data.
 *
 * @param {object} srcjson Source JSON object.
 * @returns {string}       Form Data.
 */
function greenletJsonToFormData( srcjson ) {
	if ( (typeof srcjson !== 'object') && (typeof console !== 'undefined') ) {
		console.log( '"srcjson" is not a JSON object' );
		return null;
	}
	u = encodeURIComponent;

	var urljson = '';
	var keys    = Object.keys( srcjson );

	var keysLength = keys.length
	for ( var i = 0; i < keysLength; i++ ) {
		urljson += u( keys[i] ) + '=' + u( srcjson[keys[i]] );

		if ( i < (keys.length - 1) ) {
			urljson += '&';
		}
	}
	return urljson;
}

function greenletFixMenu() {
	document.body.addEventListener( 'keyup', function ( e ) {
		if ( e.key === 'Tab' || e.keyCode === '9' ) {
			var parent = document.activeElement.parentNode
			if ( ! parent.classList.contains( 'menu-item' ) ) {
				var focused = document.querySelector( '.menu-item.focus' )
				;( focused !== null ) && focused.classList.remove( 'focus' )
				document.getElementById( 'menu-toggle' ).checked = false
			}
			;( parent.previousElementSibling !== null ) && parent.previousElementSibling.classList.remove( 'focus' )
			;( parent.nextElementSibling !== null ) && parent.nextElementSibling.classList.remove( 'focus' )
			;( parent.classList.contains( 'menu-item-has-children' ) ) && parent.classList.add( 'focus' )
			;( document.activeElement.id === 'menu-toggle' ) && ( document.activeElement.checked = true )
		}
	});

	var fixToggle = function() {
		var header = document.querySelector( '.header-column' )
		document.querySelector( '.menu-toggle-button' ).style.top = '-' + ( ( header.offsetHeight / 2 ) + 12 ) + 'px'
	}

	window.addEventListener('load', fixToggle );
	window.addEventListener('resize', fixToggle );
}

greenletFixMenu()
