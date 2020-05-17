/**
 * Font Control.
 *
 * @package greenlet
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
