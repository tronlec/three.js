/****************************************************************************
**
** Copyright (C) 2014 Digia Plc and/or its subsidiary(-ies).
** Contact: http://www.qt-project.org/legal
**
** This file is part of the QtCanvas3D module of the Qt Toolkit.
**
** $QT_BEGIN_LICENSE:LGPL$
** Commercial License Usage
** Licensees holding valid commercial Qt licenses may use this file in
** accordance with the commercial license agreement provided with the
** Software or, alternatively, in accordance with the terms contained in
** a written agreement between you and Digia.  For licensing terms and
** conditions see http://qt.digia.com/licensing.  For further information
** use the contact form at http://qt.digia.com/contact-us.
**
** GNU Lesser General Public License Usage
** Alternatively, this file may be used under the terms of the GNU Lesser
** General Public License version 3 as published by the Free Software
** Foundation and appearing in the file LICENSE.LGPLv3 included in the
** packaging of this file.  Please review the following information to
** ensure the GNU Lesser General Public License version 3 requirements
** will be met: https://www.gnu.org/licenses/lgpl.html.
**
** GNU General Public License Usage
** Alternatively, this file may be used under the terms of the GNU
** General Public License version 2.0 or later as published by the Free
** Software Foundation and appearing in the file LICENSE.GPL included in
** the packaging of this file.  Please review the following information to
** ensure the GNU General Public License version 2.0 requirements will be
** met: http://www.gnu.org/licenses/gpl-2.0.html.
**
** $QT_END_LICENSE$
**
****************************************************************************/

import QtQuick 2.0

// Helper class that makes QtQuick mouse and keyboard events more easier to handle in
// HTML compatible manner
Item {
    id: ctrlEventSource

    property alias cursorShape: inputArea.cursorShape

    signal mouseMove(int x, int y);
    signal mouseDown(int x, int y, int buttons);
    signal mouseUp(int x, int y);
    signal mouseWheel(int x, int y);
    signal mouseIn();
    signal mouseOut();

    signal keyDown(var event);
    signal keyUp(var event);

    function addEventListener(event, handler, ignored)
    {
        if (event === 'keydown') {
            ctrlEventSource.keyDown.connect(handler);
        } else if (event === 'keyup') {
            ctrlEventSource.keyUp.connect(handler);
        } else if (event === 'mousedown') {
            ctrlEventSource.mouseDown.connect(handler);
        } else if (event === 'mouseup') {
            ctrlEventSource.mouseUp.connect(handler);
        } else if (event === 'mousemove') {
            ctrlEventSource.mouseMove.connect(handler);
        } else if (event === 'mousewheel') {
            ctrlEventSource.mouseWheel.connect(handler);
        } else if (event === 'mouseout') {
            ctrlEventSource.mouseOut.connect(handler);
        } else if (event === 'mouseout') {
            ctrlEventSource.mouseIn.connect(handler);
        } else if (event === 'touchstart') {
        } else if (event === 'touchmove') {
        } else if (event === 'touchend') {
        }
    }

    function removeEventListener(event, handler, ignored)
    {
        if (event === 'keydown') {
            ctrlEventSource.keyDown.disconnect(handler);
        } else if (event === 'keyup') {
            ctrlEventSource.keyUp.disconnect(handler);
        } else if (event === 'mousedown') {
            ctrlEventSource.mouseDown.disconnect(handler);
        } else if (event === 'mouseup') {
            ctrlEventSource.mouseUp.disconnect(handler);
        } else if (event === 'mousemove') {
            ctrlEventSource.mouseMove.disconnect(handler);
        } else if (event === 'mousewheel') {
            ctrlEventSource.mouseWheel.disconnect(handler);
        } else if (event === 'mouseout') {
            ctrlEventSource.mouseOut.disconnect(handler);
        } else if (event === 'mouseout') {
            ctrlEventSource.mouseIn.disconnect(handler);
        } else if (event === 'touchstart') {
        } else if (event === 'touchmove') {
        } else if (event === 'touchend') {
        }
    }

    MouseArea {
        id: inputArea
        anchors.fill: parent
        hoverEnabled: true

        onPositionChanged: {
            ctrlEventSource.mouseMove(mouse.x, mouse.y);
        }

        onPressed: {
            ctrlEventSource.mouseDown(mouse.x, mouse.y, mouse.buttons);
        }

        onReleased: {
            ctrlEventSource.mouseUp(mouse.x, mouse.y);
        }

        onWheel: {
            ctrlEventSource.mouseWheel(wheel.angleDelta.x, wheel.angleDelta.y);
        }

        onEntered: {
            ctrlEventSource.mouseIn();
        }

        onExited: {
            ctrlEventSource.mouseOut();
        }
    }

    Keys.onPressed: {
        ctrlEventSource.keyDown(event);
    }

    Keys.onReleased: {
        ctrlEventSource.keyUp(event);
    }
}

