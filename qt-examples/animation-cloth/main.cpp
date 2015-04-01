#include <QtGui/QGuiApplication>
#include <QtCore/QDir>
#include <QtQuick/QQuickView>
#include <QtQml/QQmlEngine>
#include <QtCore/QLoggingCategory>

int main(int argc, char *argv[])
{
    QGuiApplication app(argc, argv);

    // Turns on all logging of Canvas3D
    QString loggingFilter = QString("qt.canvas3d.info.debug=true\n");
    loggingFilter += QStringLiteral("qt.canvas3d.rendering.debug=true\n")
            + QStringLiteral("qt.canvas3d.rendering.warning=true\n")
            + QStringLiteral("qt.canvas3d.glerrors.debug=true");
    QLoggingCategory::setFilterRules(loggingFilter);

    QQuickView viewer;

    // The following are needed to make examples run without having to install the module
    // in desktop environments.
#ifdef Q_OS_WIN
    QString extraImportPath(QStringLiteral("%1/../../../../%2"));
#else
    QString extraImportPath(QStringLiteral("%1/../../../%2"));
#endif
    viewer.engine()->addImportPath(extraImportPath.arg(QGuiApplication::applicationDirPath(),
                                                       QString::fromLatin1("qml")));

    qDebug() << "Settings source";
    viewer.setSource(QUrl("qrc:/animation-cloth.qml"));

    viewer.setTitle(QStringLiteral("Qt Canvas 3D + three.js Examples - Cloth Simulation"));
    viewer.setResizeMode(QQuickView::SizeRootObjectToView);
    qDebug() << "Showing";
    viewer.show();

    qDebug() << "app.exec()";
    return app.exec();
}
