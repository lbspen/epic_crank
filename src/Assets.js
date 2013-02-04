var Engine = Engine || {};

/*global Audio */

/**
 * key: value pairs of file extension: type, where type is 'Audio' or 'Image'
 * @type {Object}
 */
Engine.assetTypes = {
    // Image types
    png: 'Image', jpg: 'Image', gif: 'Image', jpeg: 'Image',

    // Audio types
    ogg: 'Audio', wav: 'Audio', m4a: 'Audio', mp3: 'Audio'
};

/**
 * key: value pairs of audio extension: mime type
 * @type {Object}
 */
Engine.audioMimeTypes = {
    mp3: 'audio/mpeg',
    ogg: 'audio/ogg; codecs="vorbis"',
    m4a: 'audio/m4a',
    wav: 'audio/wav'
};

/**
 * Looks up the asset type based on the file extension of the asset param
 * @param {String} asset Asset filename with extension
 * @return {String} 'Image', 'Audio' or 'Other'
 */
Engine.getAssetType = function( asset ) {

    var fileExtension = _(asset.split( "." )).last().toLowerCase();
    return Engine.assetTypes[ fileExtension ] || 'Other';
};

//noinspection JSUnusedGlobalSymbols
/**
 * Loads an image
 * @param {String} key Name of image
 * @param {String} src Path to asset relative to the Engine's imagePath, including filename
 * @param {function} callback This function is called on successful load
 * @param {function} errorCallback This function is called if load is not successful
 */
Engine.prototype.loadAssetImage = function( key, src, callback, errorCallback ) {
    var img = new Image();
    $(img).on( 'load', function() { callback( key, img ); });
    $(img).on( 'error', errorCallback );
    img.src = this.options.imagePath + src;
};

//noinspection JSUnusedGlobalSymbols
/**
 * Figures out if the sound can be played and loads the sound.
 * @param {string} key
 * @param {string} src Path to asset relative to the Engine's imagePath, including filename
 * @param {function} callback This function is called on successful load
 * @param {function} errorCallback This function is called if load is not successful
 * @return {Audio}
 */
Engine.prototype.loadAssetAudio = function( key, src, callback, errorCallback ) {

    // Return if the browser doesn't support sound or the sound option is off
    if (!document.createElement("audio").play || !this.options.sound ) {
        callback( key, null );
        return null;
    }

    var snd = new Audio(),
        baseName = this._removeExtension( src),
        extension;

    // Get first extension that from supported ones that works in the current browser
    extension =
        _(this.options.audioSupported)
            .detect( function( extension ) {
                return snd.canPlayType( Engine.audioMimeTypes[ extension ]) ?
                                        extension : null;
            });

    // Return if no supported sounds
    if (!extension) {
        callback( key, null );
        return null;
    }

    $(snd).on( 'error', errorCallback );
    $(snd).on( 'canplaythrough', function() {
        callback( key, snd );
    });

    snd.src = this.options.audioPath + baseName + "." + extension;
    snd.load();
    return snd;
};

//noinspection JSUnusedGlobalSymbols
/**
 * Store data for other file types
 * @param {string} key
 * @param {string} src Path to asset relative to the Engine's imagePath, including filename
 * @param {function} callback This function is called on successful load
 * @param {function} errorCallback This function is called if load is not successful
 */
Engine.prototype.loadAssetOther = function( key, src, callback, errorCallback ) {
    $.get( this.options.dataPath + src, function( data ) {
        callback( key, data );
    }).fail( errorCallback );
};

/**
 * Removes the extension from a filename
 * @param {String} filename
 * @return {String}
 */
Engine.prototype._removeExtension = function( filename ) {
    return filename.replace( /\.(\w{3,4})$/, "");
};

/**
 * Accessor
 * @param {String} name
 * @return {Object}
 */
Engine.prototype.getAsset = function( name ) {
    return Engine.GetCurrentInstance().assets[ name ];
};

/**
 * Load assets and call the callback
 * @param {Array} assets Array of Filenames
 * @param {function} callback Called on successful load
 * @param {function=} progressCallback Called as loading progresses
 * @param {function=} errorCallback Called if loading is unsuccessful
 */
Engine.prototype.load = function( assets, callback, progressCallback, errorCallback ) {

    var assetObj = {},
        engine = this;

    var errors = false,
        errorCallbackAlert = function( asset ) {
            errors = true;
            (errorCallback || function( asset ) {
                alert( "Error Loading: " + asset ); }) ( asset );
            };

    // Convert assets from array or string to hash object if needed
    if (_.isArray( assets )) {
        _.each( assets, function( asset ) {
           if (_.isObject( asset )) {
               _.extend( assetObj, asset );
           } else {
               assetObj[ asset ] = asset;
           }
        });
    } else if (_.isString( assets )) {
        assetObj[ assets ] = assets;
    } else {
        assetObj = assets;
    }

    var assetsTotal = _(assetObj).keys().length,
        assetsRemaining = assetsTotal;

    // Perform after each load
    var loadedCallback = function( key, obj ) {

        if (errors) return;

        engine.assets[ key ] = obj;
        assetsRemaining--;

        if (progressCallback) {
            progressCallback( assetsTotal - assetsRemaining, assetsTotal );
        }

        // Invoke param callback after all assets have been loaded
        if (assetsRemaining === 0 && callback) {
            callback.apply( engine );
        }
    };

    _.each( assetObj, function( asset, key ) {
        var assetType = Engine.getAssetType( asset );

        if (Engine.GetCurrentInstance().assets[ key ]) {
            loadedCallback( key, engine.assets[ key ]);
        } else {
            engine["loadAsset" + assetType](key, asset, loadedCallback,
                function() { errorCallbackAlert( asset ); });
        }
    });
};

/**
 * Loads the preloads from the member variable preloads
 * @param {function} callback Called on successful load
 * @param {function=} progressCallback Called as loading progresses
 * @param {function=} errorCallback Called on unsuccessful load
 */
Engine.prototype.preload = function( callback, progressCallback, errorCallback ) {
    if (this.preloads === undefined) {

        /**
         * Assets to be preloaded
         * @type {Array}
         */
        this.preloads = [];
    }
    this.load( _(this.preloads).uniq(), callback, progressCallback, errorCallback );
    this.preloads = [];
};

/**
 * Accessor to add an asset to the preload list
 * @param {Array|String} preloads Array of filenames to be added
 */
Engine.prototype.addPreload = function( preloads ) {
    if (this.preloads === undefined) {
        this.preloads = [];
    }
    this.preloads = this.preloads.concat( preloads );
};
