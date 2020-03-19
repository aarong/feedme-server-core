import gulp from "gulp";
import del from "del";
import sourcemaps from "gulp-sourcemaps";
import rename from "gulp-rename";
import babel from "gulp-babel";
import path from "path";

const clean = () => del(path.join(__dirname, "build"));

/*

Works in any path. Gulp.src/dest are always relative to package root (Gulpfile).

*/

const nodeTranspile = () =>
  gulp
    .src(["src/*.js", "!src/main.browser.js"]) // Don't transpile the browser entry-point
    .pipe(sourcemaps.init())
    .pipe(babel({ plugins: ["add-module-exports"] })) // No feedmeClient.default({})
    .pipe(sourcemaps.mapSources(sourcePath => `../src/${sourcePath}`))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("build/"));

const copy = () =>
  gulp.src("./{package.json,LICENSE,README.md}").pipe(gulp.dest("build/"));

export const build = gulp.series(
  // eslint-disable-line import/prefer-default-export
  clean,
  nodeTranspile,
  copy
);
