/**
 * Color Control.
 *
 * @package greenlet
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
