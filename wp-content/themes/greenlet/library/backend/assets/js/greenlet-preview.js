/**
 * Greenlet Customizer Preview.
 *
 * @package greenlet\library\backend\assets\js
 */

(function( $ ) {
	if ( ! wp || ! wp.customize ) {
		return;
	}

	/**
	 * Get current computed CSS property of an element.
	 *
	 * @param   {Element} element  DOM Element.
	 * @param   {string}  property CSS Property.
	 * @returns {string}           Current CSS Value.
	 */
	function getCurrentStyle( element, property ) {
		if ( null === element ) {
			return 'inherit'
		}
		return window.getComputedStyle( element, null ).getPropertyValue( property )
	}

	/**
	 * Add or Update Style Link.
	 *
	 * @param {string} styleId Unique style ID.
	 * @param {string} href    Link href.
	 */
	function updateStyleLink( styleId, href ) {
		var styleLink = document.getElementById( styleId )
		if ( styleLink === null ) {
			var link  = document.createElement( 'link' )
			link.id   = styleId
			link.rel  = 'stylesheet'
			link.href = href
			document.head.appendChild( link )
		} else {
			styleLink.href = href
		}
	}

	/**
	 * Bind Selector Style to contoldId.
	 *
	 * @param {string} controlId Control ID.
	 * @param {string} selector  CSS Selctor.
	 * @param {string} style     Style Property.
	 * @param {string} suffix    Unit suffix.
	 */
	function bindStyle( controlId, selector, style, suffix = '' ) {
		wp.customize(
			controlId,
			function ( value ) {
				var headTag  = document.head
				var styleTag = document.createElement( 'style' )
				styleTag.id  = controlId + '-css'
				headTag.appendChild( styleTag )

				value.bind(
					function ( to ) {
						if ( '' !== suffix ) {
							to = to + suffix
						}
						if ( 'font' === style ) {
							var newFontFamily  = ( to.family === 'Default' ) ? 'system-ui' : to.family
							newFontFamily     += ', ' + getCurrentStyle( document.querySelector( selector ), 'font-family' )
							newFontFamily      = newFontFamily.split( ', ' ).slice( 0, 5 ).join( ', ' )
							styleTag.innerHTML = selector + '{ font-family: ' + newFontFamily + '; \
							font-style: ' + to.style + '; \
							font-weight: ' + to.weight + '; \
							font-size: ' + to.size + ';}'

							if ( to.source === 'google' ) {
								var fontFamily = to.family.split( ' ' ).join( '+' )
								updateStyleLink( controlId + '-google', 'https://fonts.googleapis.com/css?family=' + fontFamily + ':' + to.weight )
							}
						} else {
							styleTag.innerHTML = selector + '{' + style + ': ' + to + ';}'
						}
					}
				)
			}
		)
	}

	var inputSelector   = 'input[type="email"], input[type="number"], input[type="search"], input[type="text"], input[type="tel"], input[type="url"], input[type="password"], textarea, select'
	var buttonSelector  = '.button, button, input[type="submit"], input[type="reset"], input[type="button"], .pagination li a, .pagination li span'
	var headingSelector = 'h1, h2, h3, h4, h5, h6, .entry-title a'

	function getPseudo ( selectors, pseudo ) {
		if ( ! Array.isArray( selectors ) ) {
			selectors = selectors.split( ',' )
		}
		if ( typeof pseudo === 'undefined' ) {
			pseudo = ':hover'
		}

		var pseudoSelectors = []
		var selectorsLength = selectors.length
		for ( var i = 0; i < selectorsLength; i++ ) {
			pseudoSelectors.push( selectors[ i ] + pseudo )
		}
		return pseudoSelectors.join( ',' )
	}

	bindStyle( 'logo_width', '.site-logo img', 'width' )
	bindStyle( 'logo_height', '.site-logo img', 'height' )
	bindStyle( 'site_bg', 'body', 'background' )
	bindStyle( 'site_color', 'body', 'color' )
	bindStyle( 'topbar_bg', '.topbar', 'background' )
	bindStyle( 'topbar_color', '.topbar', 'color' )
	bindStyle( 'header_bg', '.site-header, .site-navigation ul .children, .site-navigation ul .sub-menu', 'background' )
	bindStyle( 'header_color', '.site-header, .site-header a, .site-header .hamburger', 'color' )
	bindStyle( 'header_link_hover', '.site-header a:hover', 'color' )
	bindStyle( 'main_bg', '.site-content', 'background' )
	bindStyle( 'content_bg', '.entry-article, .sidebar > .wrap, #comments, .breadcrumb', 'background' )
	bindStyle( 'semifooter_bg', '.semifooter', 'background' )
	bindStyle( 'semifooter_color', '.semifooter', 'color' )
	bindStyle( 'footer_bg', '.site-footer', 'background' )
	bindStyle( 'footer_color', '.site-footer', 'color' )
	bindStyle( 'heading_color', headingSelector, 'color' )
	bindStyle( 'heading_hover_color', getPseudo( headingSelector ), 'color' )
	bindStyle( 'heading_font', headingSelector, 'font' )
	bindStyle( 'h1_font', 'h1', 'font' )
	bindStyle( 'h2_font', 'h2, h2.entry-title a', 'font' )
	bindStyle( 'h3_font', 'h3', 'font' )
	bindStyle( 'h4_font', 'h4', 'font' )
	bindStyle( 'h5_font', 'h5', 'font' )
	bindStyle( 'h6_font', 'h6', 'font' )
	bindStyle( 'link_color', 'a, .entry-meta li', 'color' )
	bindStyle( 'link_hover', 'a:hover', 'color' )
	bindStyle( 'link_font', 'a, .entry-meta li', 'font' )
	bindStyle( 'button_bg', buttonSelector, 'background' )
	bindStyle( 'button_color', buttonSelector, 'color' )
	bindStyle( 'button_border', buttonSelector, 'border' )
	bindStyle( 'button_hover_bg', getPseudo( buttonSelector ), 'background' )
	bindStyle( 'button_hover_color', getPseudo( buttonSelector ), 'color' )
	bindStyle( 'button_hover_border', getPseudo( buttonSelector ), 'border' )
	bindStyle( 'button_font', buttonSelector, 'font' )
	bindStyle( 'input_bg', inputSelector, 'background' )
	bindStyle( 'input_color', inputSelector, 'color' )
	bindStyle( 'input_border', inputSelector, 'border' )
	bindStyle( 'input_placeholder', getPseudo( inputSelector, '::placeholder' ), 'color' )
	bindStyle( 'input_focus_bg', getPseudo( inputSelector, ':focus' ), 'background' )
	bindStyle( 'input_focus_color', getPseudo( inputSelector, ':focus' ), 'color' )
	bindStyle( 'input_focus_border', getPseudo( inputSelector, ':focus' ), 'border' )
	bindStyle( 'input_focus_placeholder', getPseudo( getPseudo( inputSelector, ':focus' ), '::placeholder' ), 'color' )
	bindStyle( 'input_font', inputSelector, 'font' )
	bindStyle( 'para_color', 'p', 'color' )
	bindStyle( 'para_font', 'p', 'font' )
	bindStyle( 'code_bg', 'code', 'background' )
	bindStyle( 'code_color', 'code', 'color' )
	bindStyle( 'code_border', 'code', 'border' )
	bindStyle( 'code_font', 'code', 'font' )
	bindStyle( 'icons_color', '.entry-meta svg', 'fill' )
	bindStyle( 'base_font', 'body', 'font' )
	bindStyle( 'header_font', '.site-header', 'font' )
	bindStyle( 'logo_font', '.site-logo, h1.site-name a', 'font' )
	bindStyle( 'content_font', '.site-content', 'font' )
	bindStyle( 'footer_font', '.site-footer', 'font' )
	bindStyle( 'container_width', '.container', 'max-width' )
	bindStyle( 'topbar_width', '.topbar', 'max-width' )
	bindStyle( 'topbar_container', '.topbar .container', 'max-width' )
	bindStyle( 'header_width', '.site-header', 'max-width' )
	bindStyle( 'header_container', '.site-header .container', 'max-width' )
	bindStyle( 'main_width', '.site-content', 'max-width' )
	bindStyle( 'main_container', '.site-content .container', 'max-width' )
	bindStyle( 'semifooter_width', '.semifooter', 'max-width' )
	bindStyle( 'semifooter_container', '.semifooter .container', 'max-width' )
	bindStyle( 'footer_width', '.site-footer', 'max-width' )
	bindStyle( 'footer_container', '.site-footer .container', 'max-width' )
})( jQuery );
