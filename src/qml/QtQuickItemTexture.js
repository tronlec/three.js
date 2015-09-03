/**
 * @author miheikki / miikka.heikkinen@theqtcompany.com
 */

THREE.QtQuickItemTexture = function ( quickItem, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy ) {

    THREE.Texture.call( this, null, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy );

    this.generateMipmaps = false;
    this._needsUpdate = true;

    this.quickItem = quickItem;

};

THREE.QtQuickItemTexture.prototype = Object.create( THREE.Texture.prototype );
THREE.QtQuickItemTexture.prototype.constructor = THREE.QtQuickItemTexture;
