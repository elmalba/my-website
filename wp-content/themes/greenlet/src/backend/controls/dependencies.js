/**
 * Logo height and width dependencies.
 */
function manageLogoDependencies() {
	var control  = wp.customize.control( 'custom_logo' )
	var wControl = wp.customize.control( 'logo_width' )
	var hControl = wp.customize.control( 'logo_height' )

	if ( control.setting._value !== '' ) {
		$( '#customize-control-show_title' ).hide()
	}

	var widthContainer  = $( '#customize-control-logo_width' )
	var heightContainer = $( '#customize-control-logo_height' )

	var widthInput  = document.getElementById( 'length-size-ip-logo_width' )
	var heightInput = document.getElementById( 'length-size-ip-logo_height' )
	var widthRange  = document.getElementById( 'length-size-logo_width' )
	var heightRange = document.getElementById( 'length-size-logo_height' )

	var ratio = widthInput.value / heightInput.value

	if ( $( '#customize-control-custom_logo img' ).length === 0 ) {
		widthContainer.hide()
		heightContainer.hide()
	}

	widthContainer.append( '<span class="aspect dashicons dashicons-lock"></span>' )
	widthContainer.append( '<span class="lock-indicator"></span>' )

	control.setting.bind(
		function() {
			if ( control.setting._value === '' ) {
				widthContainer.hide()
				heightContainer.hide()
				$( '#customize-control-show_title' ).show()
			} else {
				widthContainer.show()
				heightContainer.show()
				$( '#customize-control-show_title' ).hide()

				var logo = document.querySelector( '#customize-control-custom_logo .attachment-thumb' )
				wControl.setting.set( logo.naturalWidth + 'px' )
				hControl.setting.set( logo.naturalHeight + 'px' )

				$( '#length-size-logo_width' ).val( logo.naturalWidth )
				$( '#length-size-ip-logo_width' ).val( logo.naturalWidth )
				$( '#length-size-logo_height' ).val( logo.naturalHeight )
				$( '#length-size-ip-logo_height' ).val( logo.naturalHeight )
			}

			ratio = widthInput.value / heightInput.value
		}
	)

	var updateAspectHeight = function() {
		if ( document.querySelector( '#customize-control-logo_width .aspect' ).classList.contains( 'dashicons-lock' ) ) {
			var newHeight     = widthInput.value / ratio
			heightRange.value = newHeight
			heightInput.value = newHeight
			hControl.setting.set( newHeight + document.getElementById( 'length-unit-logo_height' ).value )
		} else {
			ratio = widthInput.value / heightInput.value
		}
	}

	var updateAspectWidth = function() {
		if ( document.querySelector( '#customize-control-logo_width .aspect' ).classList.contains( 'dashicons-lock' ) ) {
			var newWidth     = heightInput.value * ratio
			widthRange.value = newWidth
			widthInput.value = newWidth
			wControl.setting.set( newWidth + document.getElementById( 'length-unit-logo_width' ).value )
		}
		ratio = widthInput.value / heightInput.value
	}

	$( widthRange ).on( 'input', updateAspectHeight )
	$( widthInput ).on( 'input', updateAspectHeight )
	$( heightRange ).on( 'input', updateAspectWidth )
	$( heightInput ).on( 'input', updateAspectWidth )
}

function manageAspectTogglers() {
	$( '.customize-control' ).on(
		'click',
		'.aspect',
		function() {
			this.classList.toggle( 'dashicons-lock' )
			this.classList.toggle( 'dashicons-unlock' )
		}
	)
}

/**
 * Get Cover default Columns.
 *
 * @param {string} pos Cover position.
 * @returns {string[]} Default Columns.
 */
function topBottomDefaultColumns( pos ) {
	switch ( pos ) {
		case 'topbar':
			return ['4', '8']
		case 'header':
			return ['3', '9']
		case 'semifooter':
			return ['4', '4', '4']
		case 'footer':
			return ['12']
		default:
			return ['12']
	}
}

/**
 * Get Cover columns.
 *
 * @param {array} positions Cover positions.
 * @returns {object} Cover columns.
 */
function getCoverColumns( positions = [ 'topbar', 'header', 'semifooter', 'footer' ] ) {
	var coverColumns = { 'dont-show': 'Do Not Show' }

	var ucfirst = function( s ) {
		if ( typeof s !== 'string' ) {
			return ''
		}
		return s.charAt( 0 ).toUpperCase() + s.slice( 1 )
	}

	var positionsLength = positions.length
	for ( var i = 0; i < positionsLength; i++ ) {
		var control = wp.customize.control( positions[i] + '_template' )
		var cols    = ( control.setting._value === '' ) ? topBottomDefaultColumns( positions[i] ) : control.setting._value.split( '-' )

		var colsLength = cols.length
		for ( var j = 1; j <= colsLength; j++ ) {
			coverColumns[ positions[i] + '-' + j ] = ucfirst( positions[i] ) + ' Column ' + j + ' (width = ' + cols[j - 1] + ')'
		}
	}

	return coverColumns
}

/**
 * Set logo and menu position options based on cover columns.
 */
function setTopCoverDependentColumns() {
	var control = wp.customize.control( 'show_topbar' )
	var columns
	if ( control.setting._value === false ) {
		columns = getCoverColumns( ['header'] )
	} else {
		columns = getCoverColumns( ['topbar', 'header'] )
	}

	var lControl = wp.customize.control( 'logo_position' )
	var mControl = wp.customize.control( 'mmenu_position' )
	var sControl = wp.customize.control( 'smenu_position' )

	var selected = ''
	var lOptions = ''
	var mOptions = ''
	var sOptions = ''
	for ( var column in columns ) {
		selected  = ( lControl.setting._value === column ) ? 'selected' : ''
		lOptions += '<option value="' + column + '" ' + selected + '>' + columns[column] + '</option>'
		selected  = ( mControl.setting._value === column ) ? 'selected' : ''
		mOptions += '<option value="' + column + '" ' + selected + '>' + columns[column] + '</option>'
		selected  = ( sControl.setting._value === column ) ? 'selected' : ''
		sOptions += '<option value="' + column + '" ' + selected + '>' + columns[column] + '</option>'
	}

	$( '#_customize-input-logo_position' ).html( lOptions )
	$( '#_customize-input-mmenu_position' ).html( mOptions )
	$( '#_customize-input-smenu_position' ).html( sOptions )
}

/**
 * Set menu position options based on cover columns.
 */
function setBottomCoverDependentColumns() {
	var control = wp.customize.control( 'show_semifooter' )
	var columns
	if ( control.setting._value === false ) {
		columns = getCoverColumns( ['footer'] )
	} else {
		columns = getCoverColumns( ['semifooter', 'footer'] )
	}

	var fControl = wp.customize.control( 'fmenu_position' )

	var selected = ''
	var fOptions = ''
	for ( var column in columns ) {
		selected  = ( fControl.setting._value === column ) ? 'selected' : ''
		fOptions += '<option value="' + column + '" ' + selected + '>' + columns[column] + '</option>'
	}

	$( '#_customize-input-fmenu_position' ).html( fOptions )
}

/**
 * Manage Topbar, Header, Semifooter and Footer Columns dependencies.
 * Used to adjust logo and menu positions.
 */
function manageCoverDependencies() {
	setTopCoverDependentColumns()
	setBottomCoverDependentColumns()

	var showTopControl = wp.customize.control( 'show_topbar' )
	showTopControl.setting.bind( function() { setTopCoverDependentColumns() } )

	var topbarControl = wp.customize.control( 'topbar_template' )
	topbarControl.setting.bind( function() { setTopCoverDependentColumns() } )

	var headerControl = wp.customize.control( 'header_template' )
	headerControl.setting.bind( function() { setTopCoverDependentColumns() } )

	var showBottomControl = wp.customize.control( 'show_semifooter' )
	showBottomControl.setting.bind( function() { setBottomCoverDependentColumns() } )

	var semiFooterControl = wp.customize.control( 'semifooter_template' )
	semiFooterControl.setting.bind( function() { setBottomCoverDependentColumns() } )

	var footerControl = wp.customize.control( 'footer_template' )
	footerControl.setting.bind( function() { setBottomCoverDependentColumns() } )
}

/**
 * Show and hide topbar dependencies.
 */
function manageTopbarDependencies() {
	var control  = wp.customize.control( 'show_topbar' )
	var tDivider = $( '#customize-control-header_divider' )
	tDivider.prepend( '<div class="toggler"><span class="dashicons dashicons-arrow-up-alt2"></span></div>' )

	var toggleTopbar = function() {
		$( '#customize-control-fixed_topbar' ).toggleClass( 'collapse' )
		$( '#customize-control-topbar_template' ).toggleClass( 'collapse' )
		$( '#customize-control-topbar_content_source' ).toggleClass( 'collapse' )
		$( '#customize-control-topbar_width' ).toggleClass( 'collapse' )
		$( '#customize-control-topbar_container' ).toggleClass( 'collapse' )
		$( '#customize-control-header_divider .toggler' ).toggleClass( 'toggled' )
		$( '#customize-control-topbar_bg' ).toggle()
		$( '#customize-control-topbar_color' ).toggle()
	}

	if ( control.setting._value === false ) {
		toggleTopbar()
	}

	$( control.selector + ' input[type="checkbox"]' ).on( 'change', toggleTopbar )
	tDivider.on( 'click', '.toggler span', toggleTopbar )
}

/**
 * Show and hide semifooter dependencies.
 */
function manageSemifooterDependencies() {
	var control  = wp.customize.control( 'show_semifooter' )
	var fDivider = $( '#customize-control-footer_divider' )
	fDivider.prepend( '<div class="toggler"><span class="dashicons dashicons-arrow-up-alt2"></span></div>' )

	var toggleSemiFooter = function() {
		$( '#customize-control-semifooter_template' ).toggleClass( 'collapse' )
		$( '#customize-control-semifooter_content_source' ).toggleClass( 'collapse' )
		$( '#customize-control-semifooter_width' ).toggleClass( 'collapse' )
		$( '#customize-control-semifooter_container' ).toggleClass( 'collapse' )
		$( '#customize-control-footer_divider .toggler' ).toggleClass( 'toggled' )
		$( '#customize-control-semifooter_bg' ).toggle()
		$( '#customize-control-semifooter_color' ).toggle()
	}

	if ( control.setting._value === false ) {
		toggleSemiFooter()
	}

	$( control.selector + ' input[type="checkbox"]' ).on( 'change', toggleSemiFooter )
	fDivider.on( 'click', '.toggler span', toggleSemiFooter )
}

/**
 * Change Sidebars quantity dependencies.
 */
function manageSidebarDependencies() {
	var selector = $( '#_customize-input-sidebars_qty' )

	selector.on(
		'change',
		function() {
			var controls = $( '#customize-theme-controls' )
			var template = controls.find( '.gl-template-selection' )
			var sidebars = this.value
			template.each(
				function() {
					var current     = this.value
					var selected    = ( current === 'main' ) ? 'selected' : ''
					var matcherHtml = '<option value="main" ' + selected + '>Main Content</option>'

					for ( var j = 1; j <= sidebars; j ++ ) {
						selected     = ( current === 'sidebar-' + j ) ? 'selected' : ''
						matcherHtml += '<option value="sidebar-' + j + '" ' + selected + '>Sidebar ' + j + '</option>'
					}

					this.innerHTML = matcherHtml
				}
			);
		}
	)
}

wp.customize.bind(
	'ready',
	function () {
		manageLogoDependencies()
		manageCoverDependencies()
		manageTopbarDependencies()
		manageSemifooterDependencies()
		manageSidebarDependencies()
		manageAspectTogglers()
	}
);
