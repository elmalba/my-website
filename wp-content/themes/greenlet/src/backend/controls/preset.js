/**
 * Preset Control.
 *
 * @package greenlet
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
