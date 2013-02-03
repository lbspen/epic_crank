var Engine = Engine || {};

var KEY_NAMES = { LEFT: 37, RIGHT: 39, SPACE: 32,
    UP: 38, DOWN: 40, Z: 90, X:88 };

var DEFAULT_KEYS = { LEFT: 'left', RIGHT: 'right', UP: 'up', DOWN: 'down',
    SPACE: 'fire', Z: 'fire', X: 'action' };

Engine.Input = function() {

    /**
     * Encapsulates translation between user interaction with input devices and
     * game actions.
     * @class
     * @type {Engine.InputSystem}
     */
    Engine.InputSystem = Engine.Evented.extend({

        name: "InputSystem",

        /**
         * Keycode / action name pairs
         * @type {object}
         */
        keys: {},
        keyboardEnabled: false,

        /**
         * Binds a key code to an action
         * @param {number} key Element of KEY_NAMES or some other keycode
         * @param {string} name Name of the action
         */
        bindKey: function( key, name ) {
            this.keys[ KEY_NAMES[ key ] || key ] = name;
        },

        /**
         * Binds key codes to actions as specified in the keys param or if none, uses the defaults.
         * Keyboard is enabled
         * @param {object=} keys Keycode / action name pairs
         */
        keyboardControls: function( keys ) {
            keys = keys || DEFAULT_KEYS;
            _(keys).each( function( name, key ) {
                this.bindKey( key, name );
            }, this);
            this.enableKeyboard();
        },

        /**
         * Set up the key up and key down events, make the drawing object selectable
         * and remove the focus outline
         */
        enableKeyboard: function() {

            // Skip if keyboard has already been enabled
            if (!this.keyboardEnabled) {

                var inputSystem = this;
                var engine = this.engine;

                engine.$el.attr( 'tabindex', 0 ).css( 'outline', 0 );

                engine.$el.keydown( function( e ) {

                    if (inputSystem.keys[ e.keyCode ]) {
                        var actionName = inputSystem.keys[ e.keyCode ];
                        engine.currentInputs[ actionName ] = true;
                        inputSystem.trigger( actionName );
                        inputSystem.trigger( 'keydown', e.keyCode );
                    }
                    e.preventDefault();
                });

                engine.$el.keyup( function ( e ) {

                    if (inputSystem.keys[ e.keyCode ]) {
                        var actionName = inputSystem.keys[ e.keyCode ];
                        engine.currentInputs[ actionName ] = true;
                        inputSystem.trigger( actionName + "Up" );
                        inputSystem.trigger( 'keyup', e.keyCode );
                    }
                    e.preventDefault();
                });
                this.keyboardEnabled = true;
            }
        }
    });

    /**
     * Manages event binding, setup of devices
     * @type {Engine.InputSystem}
     */
    this.inputSystem = new Engine.InputSystem();

    var engineInstance = Engine.GetCurrentInstance();
    engineInstance.inputSystem = this.inputSystem;

    /**
     * Reference to the game engine
     * @type {Engine}
     */
    this.inputSystem.engine = engineInstance;
    this.inputSystem.keyboardControls();

    return this;
};