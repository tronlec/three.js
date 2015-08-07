/**
 * @author miheikki / miikka.heikkinen@theqtcompany.com
 */

THREE.QuickItemTexture = function ( quickItem, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy ) {

    THREE.Texture.call( this, null, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy );

    this.generateMipmaps = false;
    this._needsUpdate = true;

    this.quickItem = quickItem;

};

THREE.QuickItemTexture.prototype = Object.create( THREE.Texture.prototype );
THREE.QuickItemTexture.prototype.constructor = THREE.QuickItemTexture;
