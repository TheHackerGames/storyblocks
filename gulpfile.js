'use strict';

const path = require('path');
const gulp = require('gulp');
const gulpif = require('gulp-if');
const url = require('url');
const fs = require('fs');
const browserSync = require('browser-sync');
// Got problems? Try logging 'em
// const logging = require('plylog');
// logging.setVerbose();

// !!! IMPORTANT !!! //
// Keep the global.config above any of the gulp-tasks that depend on it
global.config = {
    polymerJsonPath: path.join(process.cwd(), 'polymer.json'),
    build: {
        rootDirectory: 'build',
        bundledDirectory: 'bundled',
        unbundledDirectory: 'unbundled',
        // Accepts either 'bundled', 'unbundled', or 'both'
        // A bundled version will be vulcanized and sharded. An unbundled version
        // will not have its files combined (this is for projects using HTTP/2
        // server push). Using the 'both' option will create two output projects,
        // one for bundled and one for unbundled
        bundleType: 'both'
    },
    // Path to your service worker, relative to the build root directory
    serviceWorkerPath: 'service-worker.js',
    // Service Worker precache options based on
    // https://github.com/GoogleChrome/sw-precache#options-parameter
    swPrecacheConfig: {
        navigateFallback: '/index.html'
    }
};


// The source task will split all of your source files into one
// big ReadableStream. Source files are those in src/** as well as anything
// added to the sourceGlobs property of polymer.json.
// Because most HTML Imports contain inline CSS and JS, those inline resources
// will be split out into temporary files. You can use gulpif to filter files
// out of the stream and run them through specific tasks. An example is provided
// which filters all images and runs them through imagemin
function source() {
    return project.splitSource()
        // Add your own build tasks here!
        .pipe(gulpif('**/*.{png,gif,jpg,svg}', images.minify()))
        .pipe(project.rejoin()); // Call rejoin when you're finished
}

// The dependencies task will split all of your bower_components files into one
// big ReadableStream
// You probably don't need to do anything to your dependencies but it's here in
// case you need it :)
function dependencies() {
    return project.splitDependencies()
        .pipe(project.rejoin());
}



gulp.task('watch', function() {
    browserSync.init({
        server: {
            baseDir: "./src",
            middleware: function(req, res, next) {
                var fileName = url.parse(req.url);
                fileName = fileName.href.split(fileName.search).join("");
                var fileExists = fs.existsSync('src' + fileName);
                if (!fileExists && fileName.indexOf("browser-sync-client") < 0) {
                    req.url = "/index.html";
                }
                return next();
            }
        },
        port: 8080,
        open: false
    });
    return gulp.watch('./src/**/*').on('change', function(e) {
        browserSync.reload();
    });
});
