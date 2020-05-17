/**
 * Greenlet Customizer Controls.
 *
 * @package greenlet
 */

(function( $ ) {

	/**
	 * Greenlet Helpers.
	 */
	$( window ).on(
		'load',
		function() {
			$( 'html' ).addClass( 'window-loaded' );
		}
	);

	var gl = {
		debounce: function debounce( wait, func, immediate ) {
			var timeout
			return function() {
				var context = this, args = arguments
				var later   = function() {
					timeout = null;
					if ( ! immediate ) {
						func.apply( context, args )
					}
				}
				var callNow = immediate && ! timeout
				clearTimeout( timeout )

				timeout = setTimeout( later, wait )
				if ( callNow ) {
					func.apply( context, args )
				}
			}
		}
	}

	/**
	 * Multicheck Control.
	 */
	wp.customize.controlConstructor['multicheck'] = wp.customize.Control.extend(
		{
			ready: function() {
				var control    = this
				var checkboxes = $( control.selector + ' input[type="checkbox"]' )

				checkboxes.on(
					'change',
					function () {
						var val     = Array.from( control.setting._value )
						var current = $( this ).val()
						var index   = val.indexOf( current )

						if ( $( this ).prop( 'checked' ) ) {
							if ( index === - 1 ) {
								val.push( current )
							}
						} else {
							if ( index !== - 1 ) {
								val.splice( index, 1 )
							}
						}

						control.setting.set( val )
					}
				)
			}
		}
	)

	/**
	 * Radio Image Control.
	 */
	wp.customize.controlConstructor['radio-image'] = wp.customize.Control.extend(
		{
			ready: function () {
				var control = this
				var radios  = $( control.selector + ' input[type="radio"]' )

				radios.on(
					'change',
					function () {
						control.setting.set( this.value )
					}
				)
			}
		}
	)

	/**
	 * Template Control.
	 */
	wp.customize.controlConstructor['template'] = wp.customize.Control.extend(
		{
			ready: function () {
				var control  = this
				var radios   = $( control.selector + ' input[type="radio"]' )
				var rawInput = $( control.selector + ' #' + control.id + '-text' )

				var setValue = function( value, element ) {
					if ( element === 'input' ) {
						rawInput.val( value )
					} else if ( element === 'radios' ) {
						radios.val( [ value ] )
					}
					control.setting.set( value )
				}

				rawInput.on( 'input', gl.debounce( 500, function() { setValue( this.value, 'radios' ) } ) )
				radios.on( 'change', function () { setValue( this.value, 'input' ) } )
			}
		}
	)

	/**
	 * Template Selector Control.
	 */
	wp.customize.controlConstructor['template-sequence'] = wp.customize.Control.extend(
		{
			ready: function() {
				var control  = this
				var radios   = $( control.selector + ' input[type="radio"]' )
				var val      = control.setting._value
				var template = val.template

				// Listen to Template selection change.
				radios.on(
					'change',
					function () {
						template        = $( this ).val()
						var cols        = template.split( '-' )
						var colsLength  = cols.length
						var matcherHtml = ''
						var sequence    = [ 'main' ]
						var sidebars    = $( '#_customize-input-sidebars_qty' ).val()

						for ( var i = 1; i <= colsLength; i ++ ) {
							matcherHtml += '<div class="gl-template-matcher col-' + cols[ i - 1 ] + '">'
							matcherHtml += '<select class="gl-template-selection">'
							var selected = ( i === 1 ) ? 'selected' : ''
							matcherHtml += '<option value="main" ' + selected + '>Main Content</option>'
							for ( var j = 1; j <= sidebars; j ++ ) {
								selected     = ( i === ( j + 1 ) ) ? 'selected' : ''
								matcherHtml += '<option value="sidebar-' + j + '" ' + selected + '>Sidebar ' + j + '</option>'
							}
							matcherHtml += '</select>'
							matcherHtml += '<div class="gl-template-matcher-column">col ' + i + ' (' + cols[ i - 1 ] + ')</div>'
							matcherHtml += '</div>'
							if ( i < colsLength ) {
								sequence.push( 'sidebar-' + i )
							}
						}

						$( '#customize-control-' + control.id ).find( '.gl-template-matcher-sequence' ).html( matcherHtml )

						val = {
							template: template,
							sequence: sequence
						}

						control.setting.set( val )
					}
				)

				// Listen to Template column sequence change.
				$( control.selector ).on(
					'change',
					'.gl-template-matcher select',
					function () {
						// Update control value.
						var sequence = []
						$( this ).parent().parent().find( 'select' ).each(
							function () {
								sequence.push( $( this ).val() )
							}
						);

						val = {
							template: template,
							sequence: sequence
						}

						control.setting.set( val )
					}
				)
			}
		}
	)

	/**
	 * Range Control.
	 */
	wp.customize.controlConstructor['range'] = wp.customize.Control.extend(
		{
			ready: function() {
				var control  = this
				control.container.append( '<span class="reset dashicons dashicons-undo"></span>' )
				var resetVal = control.setting._value

				$( control.selector + ' .reset' ).on(
					'click',
					function() {
						control.setting.set( resetVal )
					}
				)
			}
		}
	)

	/**
	 * Color Control.
	 */
	wp.customize.controlConstructor['gl-color'] = wp.customize.Control.extend(
		{
			ready: function() {
				var control = this
				var picker  = $( control.selector + ' .color-picker' )
				var options = {
					change: function(event, ui) {
						var color = ui.color.toString();
						if ( $( 'html' ).hasClass( 'window-loaded' ) ) {
							control.setting.set( color )
						}
					},
					clear: function() {
						control.setting.set( '' );
					}
				}
				if ( control.params.palettes.length > 0 ) {
					options['palettes'] = control.params.palettes
				}
				picker.wpColorPicker( options )
			}
		}
	)

	/**
	 * Border Control.
	 */
	wp.customize.controlConstructor['border'] = wp.customize.Control.extend(
		{
			ready: function() {
				// Set initial Values.
				var control       = this
				var widthSelector = $( '#border-width-' + control.id )
				var styleSelector = $( '#border-style-' + control.id )
				var colorSelector = $( '#border-color-' + control.id )

				var border      = control.setting._value
				var borderParts = border.split( ' ' )

				var width = 0
				var style = 'none'
				var color = '#000000'

				if ( borderParts.length === 3 ) {
					width = borderParts[0]
					style = borderParts[1]
					color = borderParts[2]

					// Set width.
					if ( width.indexOf( 'px' ) !== -1 ) {
						width = width.split( 'px' )[0]
					}

					// Set style options.
					var options      = ''
					var styles       = [ 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset', 'none', 'hidden' ]
					var stylesLength = styles.length
					for ( var i = 0; i < stylesLength; i++ ) {
						var selected = ( styles[ i ] === style ) ? 'selected' : ''
						options     += '<option value="' + styles[ i ] + '" ' + selected + '>' + styles[ i ] + '</option>'
					}
					styleSelector.html( options )
				}

				widthSelector.val( width )
				styleSelector.val( style )
				colorSelector.val( color )

				function setBorder() {
					if ( $( 'html' ).hasClass( 'window-loaded' ) ) {
						var newValue = widthSelector.val() + 'px ' + styleSelector.val() + ' ' + colorSelector.val()
						control.setting.set( newValue );
					}
				}

				// Listen to changes.
				widthSelector.on( 'change', setBorder )
				styleSelector.on( 'change', setBorder )
				colorSelector.on( 'change', setBorder )
			}
		}
	)

	/**
	 * Font Control.
	 */
	wp.customize.controlConstructor['font'] = wp.customize.Control.extend(
		{
			ready: function() {
				var control  = this
				var select   = $( '#font-family-' + control.id )
				var sSelect  = $( '#font-style-' + control.id )
				var wSelect  = $( '#font-weight-' + control.id )
				var sRange   = $( '#font-size-' + control.id )
				var sizeIp   = $( '#font-size-ip-' + control.id )
				var suSelect = $( '#font-size-unit-' + control.id )

				var currentFontDetails = {}

				function setFontOptions( fontFamily = false, fontStyle = false, fontWeight = false, update = false ) {
					var font = JSON.parse( JSON.stringify( control.setting._value ) )

					// If no details are given ( initial load ) set Font Family options.
					if ( ! fontFamily && ! fontStyle && ! fontWeight ) {
						fontFamily  = font.family
						var display = ( 'Default' === fontFamily ) ? 'Default System Font' : fontFamily
						var options = '<option value="' + fontFamily + '" selected>' + display + '</option>'
						select.html( options )
					}

					// If fontFamily is given set Font Style options.
					if ( ! fontStyle && ! fontWeight ) {
						// fontFamily is given. Update font details.
						currentFontDetails = control.getFontDetails( fontFamily )

						fontStyle    = font.style
						var sOptions = ''

						// If fontStyle not in currentFontDetails.style set first available style.
						if ( ! currentFontDetails.variants.hasOwnProperty( fontStyle ) ) {
							fontStyle = Object.keys( currentFontDetails.variants )[0]
						}

						for ( var style in currentFontDetails.variants ) {
							var sSelected = ( style === fontStyle ) ? 'selected="selected"' : ''
							sOptions     += '<option value="' + style + '" ' + sSelected + '>' + style + '</option>'
						}
						sSelect.html( sOptions )
					}

					// If fontStyle is given set Font Weight options.
					if ( ! fontWeight ) {
						currentFontDetails[ 'style' ] = fontStyle

						fontWeight       = font.weight
						var fontWeights  = currentFontDetails.variants[ fontStyle ]
						var weightLength = fontWeights.length

						// If fontWeight not in currentFontDetails.style[ fontStyle ] set nearest weight.
						if ( currentFontDetails.variants[ fontStyle ].indexOf( fontWeight ) === -1 ) {
							fontWeight = control.getNearestWeight( fontWeight, currentFontDetails.variants[ fontStyle ] )
						}

						var wOptions = ''
						for ( var j = 0; j < weightLength; j++ ) {
							var wSelected = ( fontWeights[j].toString() === fontWeight ) ? 'selected="selected"' : ''
							wOptions     += '<option value="' + fontWeights[j] + '" ' + wSelected + '>' + fontWeights[j] + '</option>'
						}
						wSelect.html( wOptions )
					}

					if ( fontWeight ) {
						currentFontDetails[ 'weight' ] = fontWeight
					}

					if ( update ) {
						font[ 'family' ]   = currentFontDetails.family
						font[ 'style' ]    = currentFontDetails.style
						font[ 'weight' ]   = currentFontDetails.weight
						font[ 'source' ]   = currentFontDetails.source
						font[ 'category' ] = currentFontDetails.category
						control.setting.set( font )
					}
				}
				setFontOptions()

				var choiceObj = new Choices( '#font-family-' + control.id, { 'shouldSort': false } )
				$( control.selector + ' .choices' ).on( 'click', function() { control.addFontToChoices( choiceObj, currentFontDetails.family ) } )

				select.on( 'change', function() { setFontOptions( this.value, false, false, true ) } )
				sSelect.on( 'change', function() { setFontOptions( false, this.value, false, true ) } )
				wSelect.on( 'change', function() { setFontOptions( false, false, this.value, true ) } )

				function setFontSize() {
					var size     = control.setting._value.size
					var matches  = size.match( /^([+-]?(?:\d+|\d*\.\d+))([a-z]*|%)$/ )
					var fontSize = matches[ 1 ]
					var sizeUnit = matches[ 2 ]
					sRange.val( fontSize )
					sizeIp.val( fontSize )
					suSelect.val( sizeUnit )
				}
				setFontSize()

				function updateFontSize( element ) {
					var font     = JSON.parse( JSON.stringify( control.setting._value ) )
					var fontSize = ( element !== suSelect[0] ) ? element.value : sizeIp.val()
					var sizeUnit = ( element === suSelect[0] ) ? element.value : suSelect.val()
					if ( element === sRange[0] ) {
						sizeIp.val( fontSize )
					} else if ( element === sizeIp[0] ) {
						sRange.val( fontSize )
					}

					font[ 'size' ] = '' + fontSize + sizeUnit
					control.setting.set( font );
				}

				sRange.on( 'change', function() { updateFontSize( this ) } )
				sizeIp.on( 'change', function() { updateFontSize( this ) } )
				suSelect.on( 'change', function() { updateFontSize( this ) } )
			},
			addFontToChoices: function( choiceObj, currentFont ) {
				if ( 'choicesAdded' in choiceObj ) {
					return
				}
				var allChoices = this.getFontChoices( currentFont )
				choiceObj.setChoices( allChoices, 'value', 'label', true )
				choiceObj.showDropdown()

				choiceObj.choicesAdded = true
			},
			getFontChoices: function( currentFont ) {
				var allChoices = [{
					label: 'System Fonts',
					choices: []
				}, {
					label: 'Google Fonts',
					choices: []
				}]

				for ( var systemFont in greenletAllFonts.system ) {
					var label = ( 'Default' === systemFont ) ? 'Default System Font' : systemFont
					allChoices[0].choices.push( { value: systemFont, label: label, selected: ( systemFont === currentFont ) } )
				}

				for ( var googleFont in greenletAllFonts.google ) {
					allChoices[1].choices.push( { value: googleFont, label: googleFont, selected: ( googleFont === currentFont ) } )
				}

				return allChoices
			},
			getFontDetails: function( fontFamily ) {
				var details = { 'family': fontFamily, 'source': 'system' }
				if ( greenletAllFonts.system.hasOwnProperty( fontFamily ) ) {
					details[ 'variants' ] = this.params.fontDefaults.variants
					details[ 'category' ] = greenletAllFonts.system[ fontFamily ].category
				} else if ( greenletAllFonts.google.hasOwnProperty( fontFamily ) ) {
					var variants = greenletAllFonts.google[ fontFamily ][ 0 ]
					var category = greenletAllFonts.google[ fontFamily ][ 1 ]

					details[ 'source' ]   = 'google'
					details[ 'category' ] = category
					details[ 'variants' ] = {}
					if ( variants[0].length > 0 ) {
						details[ 'variants' ][ 'normal' ] = variants[0]
					}
					if ( variants[1].length > 0 ) {
						details[ 'variants' ][ 'italic' ] = variants[1]
					}
				}
				return details;
			},
			getNearestWeight: function( weight, weightsArray ) {
				return weightsArray.reduce(
					function ( prev, curr ) {
						return Math.abs( curr - weight ) < Math.abs( prev - weight ) ? curr : prev
					}
				)
			}
		}
	)

	/**
	 * Length Control.
	 */
	wp.customize.controlConstructor['length'] = wp.customize.Control.extend(
		{
			ready: function() {
				var control  = this
				var resetVal = control.setting._value

				var lengthRange = $( '#length-size-' + control.id )
				var lengthInput = $( '#length-size-ip-' + control.id )
				var unitSelect  = $( '#length-unit-' + control.id )

				function setLength( value = false ) {
					var size = ''
					if ( false !== value ) {
						size = value
					} else {
						size = control.setting._value
					}
					var matches    = size.match( /^([+-]?(?:\d+|\d*\.\d+))([a-z]*|%)$/ )
					var lengthSize = ( null === matches ) ? '' : matches[ 1 ]
					var lengthUnit = ( null === matches ) ? 'px' : matches[ 2 ]
					lengthRange.val( lengthSize )
					lengthInput.val( lengthSize )
					unitSelect.val( lengthUnit )
				}
				setLength()

				function updateLength( element ) {
					var lengthSize = ( element !== unitSelect[0] ) ? element.value : lengthInput.val()
					var lengthUnit = ( element === unitSelect[0] ) ? element.value : unitSelect.val()
					if ( element === lengthRange[0] ) {
						lengthInput.val( lengthSize )
					} else if ( element === lengthInput[0] ) {
						lengthRange.val( lengthSize )
					}
					control.setting.set( '' + lengthSize + lengthUnit )
				}

				lengthRange.on( 'input', function() { updateLength( this ) } )
				lengthInput.on( 'input', function() { updateLength( this ) } )
				unitSelect.on( 'change', function() { updateLength( this ) } )

				$( control.selector + ' .reset' ).on(
					'click',
					function() {
						control.setting.set( resetVal )
						setLength( resetVal )
					}
				)
			}
		}
	)

	/**
	 * Preset Control.
	 */
	wp.customize.controlConstructor['preset'] = wp.customize.Control.extend(
		{
			ready: function () {
				var control = this
				var radios  = $( control.selector + ' input[type="radio"]' )

				var defaultPreset = control.params.presets['Default']
				setTimeout(
					function() {
						var fontDefaults = defaultPreset['all_fonts']

						for ( var setting in defaultPreset ) {
							if ( setting.indexOf( '_font' ) === -1 ) {
								continue
							}
							for ( var prop in fontDefaults ) {
								if ( typeof defaultPreset[ setting ] !== 'object' ) {
									defaultPreset[ setting ] = {}
								}
								if ( ! ( prop in defaultPreset[ setting ] ) ) {
									defaultPreset[ setting ][ prop ] = fontDefaults[ prop ]
								}
							}
						}
						delete defaultPreset['all_fonts']
					},
					0
				)

				var deepMerge = function(targetObject, source) {
					var target   = Object.assign( {}, targetObject )
					var allFonts = false
					if ( 'all_fonts' in target ) {
						allFonts = true
					}
					for ( var key in source ) {
						if ( ! Object.hasOwnProperty.call( source, key ) ) {
							continue
						}
						if ( ! ( key in target ) ) {
							target[ key ] = source[ key ]
						} else if ( ( typeof source[ key ] === 'object' ) && ! Array.isArray( source[ key ] ) ) {
							target[ key ] = deepMerge( target[ key ], source[ key ] )
						}

						if ( ( key.indexOf( '_font' ) !== -1 ) && ( allFonts === true ) ) {
							target[ key ] = deepMerge( target['all_fonts'], target[ key ] )
						}
					}
					return target
				}

				radios.on(
					'change',
					function () {
						var confirm = window.confirm( 'This will override all customizer settings and\nApply "' + this.value + '" preset.\nProceed?' )
						if ( confirm === false ) {
							return
						}
						var currentPreset = deepMerge( control.params.presets[ this.value ], defaultPreset )
						delete currentPreset['all_fonts']
						for (var prop in currentPreset) {
							wp.customize.control( prop ).setting.set( currentPreset[ prop ] )
						}
					}
				)
			}
		}
	)

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

})( jQuery );
