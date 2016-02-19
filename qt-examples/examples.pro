TEMPLATE = subdirs

SUBDIRS += animation-cloth \
           buffergeometry \
           camera \
           controls-transform \
           geometry-text \
           interactive-draggablecubes \
           interactive-voxel-painter \
           loader-gltf \
           loader-ply \
           materials \
           materials-texture-compressed \
           multiple-canvases-grid \
           morphtargets \
           particles-billboards-colors

equals(QT_MAJOR_VERSION, 5) {
    # 5.6 content
    greaterThan(QT_MINOR_VERSION, 5) {
        SUBDIRS += quickitemtexture
    }
}


